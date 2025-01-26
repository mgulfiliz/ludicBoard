import { useGetTasksQuery, useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/state/api";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import TaskColumn from "./TaskColumn";
import EditTaskModal from "./EditTaskModal";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask, setEditTask] = useState<TaskType | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  const handleEditTask = (task: TaskType) => {
    setEditTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask({ taskId });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DndProvider>
      <EditTaskModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={editTask}
      />
    </>
  );
};

export default BoardView;