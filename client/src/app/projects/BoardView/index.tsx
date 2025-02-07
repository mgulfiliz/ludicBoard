import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/lib/api/api";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task } from "@/types";
import TaskColumn from "./TaskColumn";
import EditTaskModal from "@/components/tasks/modals/EditTaskModal";
import TaskView from "@/components/ui/TaskView";

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask({ taskId });
  };

  const renderTasks = (tasks: Task[]) => (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            moveTask={moveTask}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        ))}
      </div>
      {editTask && isEditModalOpen && (
        <EditTaskModal
          task={editTask}
          open={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditTask(null);
          }}
        />
      )}
    </DndProvider>
  );

  return (
    <TaskView 
      id={id} 
      setIsModalNewTaskOpen={setIsModalNewTaskOpen} 
      renderTasks={renderTasks} 
      viewName="Board View"
    />
  );
};

export default BoardView;
