import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import TaskView from "@/components/TaskView";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  const renderTasks = (tasks: Task[]) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {tasks.map((task: Task) => <TaskCard key={task.id} task={task} />)}
    </div>
  );

  return (
    <TaskView 
      id={id} 
      setIsModalNewTaskOpen={setIsModalNewTaskOpen} 
      renderTasks={renderTasks} 
      viewName="List View"
    />
  );
};

export default ListView;
