import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { Task as TaskType } from "@/types";
import { MessageSquareMore, UserIcon } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import TaskActions from "@/components/tasks/actions/TaskActions";
import TaskComments from "./TaskComments";

type TaskProps = {
  task: TaskType;
  handleDeleteTask: (taskId: number) => void;
  handleEditTask: (task: TaskType) => void;
  currentUserId?: number;
};

const Task = ({ 
  task, 
  handleDeleteTask, 
  handleEditTask, 
}: TaskProps) => {
  const [showComments, setShowComments] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags || [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const UserAvatar = ({ user }: { user: TaskType['assignee'] | TaskType['author'] }) => {
    if (!user) return null;
    
    return user.profilePictureUrl ? (
      <Image
        key={user.userId}
        src={`/${user.profilePictureUrl}`}
        alt={user.username}
        width={30}
        height={30}
        className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/default-avatar.png';
        }}
      />
    ) : (
      <div className="h-8 w-8 rounded-full border-2 border-white dark:border-dark-secondary bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
        <UserIcon size={20} className="text-gray-500 dark:text-neutral-400" />
      </div>
    );
  };

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
          ? "bg-yellow-200 text-yellow-700"
          : priority === "Medium"
          ? "bg-green-200 text-green-700"
          : priority === "Low"
          ? "bg-blue-200 text-blue-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={`/${task.attachments[0].fileURL}`}
          alt={task.attachments[0].fileName}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <TaskActions
            task={task}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
          />
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <UserAvatar user={task.author} />
            <div className="ml-2 flex -space-x-[6px] overflow-hidden">
              <UserAvatar user={task.assignee} />
            </div>
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center hover:text-gray-700 dark:hover:text-neutral-400 transition-colors"
            >
              <MessageSquareMore size={20} />
              <span className="ml-1 text-sm dark:text-neutral-400">
                {numberOfComments}
              </span>
            </button>
          </div>
        </div>
      </div>
      {showComments && (
        <TaskComments 
          taskId={task.id} 
          comments={task.comments || []} 
          assignee={task.assignee}
          author={task.author}
        />
      )}
    </div>
  );
};

export default Task;