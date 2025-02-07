import React from 'react';
import { useGetTasksQuery } from '@/lib/api/api';
import Header from '@/components/layout/Header';
import { Task } from '@/types';

type TaskViewProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  renderTasks: (tasks: Task[]) => React.ReactNode;
  viewName?: string;
};

const TaskView: React.FC<TaskViewProps> = ({ 
  id, 
  setIsModalNewTaskOpen, 
  renderTasks,
  viewName = 'Tasks'
}) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="px-4 pb-8 xl:px-6">
      <Header
        name={viewName}
        buttonComponent={
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
        isSmallText
      />
      {tasks && renderTasks(tasks)}
    </div>
  );
};

export default TaskView;
