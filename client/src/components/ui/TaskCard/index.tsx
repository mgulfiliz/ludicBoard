import { Task, User } from "@/lib/api/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  // Combine author and assignees
  const allUsers = React.useMemo(() => {
    const users: (User & { isAuthor?: boolean })[] = [];
    
    // Add author first if exists
    if (task.author) {
      users.push({ ...task.author, isAuthor: true });
    }

    // Add assignees, avoiding duplicates
    const assignedUsers = task.assignees || [];

    assignedUsers.forEach(assignee => {
      if (!users.some(u => u.userId === assignee.userId)) {
        users.push({ ...assignee, isAuthor: false });
      }
    });

    return users;
  }, [task]);

  return (
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
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
      <p>
        <strong>Status:</strong> {task.status}
      </p>
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>
      <p>
        <strong>Tags:</strong> {task.tags?.join(', ') || "No tags"}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
      </p>
      
      {/* Users Section */}
      <div className="mt-2 flex items-center">
        <strong className="mr-2">Users:</strong>
        <div className="flex items-center -space-x-2">
          {allUsers.slice(0, 3).map((user) => (
            <div key={user.userId} className="relative">
              <Image 
                src={user.profilePictureUrl || '/default-avatar.png'} 
                alt={user.username || 'User Avatar'} 
                width={32} 
                height={32} 
                className="rounded-full border-2 border-white dark:border-dark-secondary"
                title={`${user.username}${user.isAuthor ? ' (Author)' : ''}`}
              />
            </div>
          ))}
          {allUsers.length > 3 && (
            <div 
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-tertiary flex items-center justify-center text-xs font-bold text-gray-600 dark:text-white border-2 border-white dark:border-dark-secondary"
              title={`${allUsers.length - 3} more users`}
            >
              +{allUsers.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
