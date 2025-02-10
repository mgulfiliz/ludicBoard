"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/lib/api/api";
import React, { useState } from "react";
import { useAppSelector } from "../redux";
import { 
  DataGrid, 
  GridColDef 
} from "@mui/x-data-grid";
import { 
  Button,
  useMediaQuery,
  useTheme 
} from "@mui/material";
import Header from "@/components/layout/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ModalNewProject from "@/app/projects/ModalNewProject"
import ProjectListModal from "@/app/projects/ProjectListModal";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const router = useRouter();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isProjectListModalOpen, setIsProjectListModalOpen] = useState(false);

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({ projectId: parseInt("1") });
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksLoading || isProjectsLoading) return <div>Loading..</div>;
  if (tasksError || !tasks || !projects) return <div>Error fetching data</div>;

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  const handleCreateProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleViewTasks = () => {
    router.push('/tasks');
  };

  const handleTeamPerformance = () => {
    router.push('/teams');
  };

  const handleCompletedProjects = () => {
    router.push('/projects?status=completed');
  };

  const handleViewProjectList = () => {
    setIsProjectListModalOpen(true);
  };

  const quickActionCards = [
    {
      title: "Create Project",
      icon: Briefcase,
      onClick: handleCreateProject,
      description: "Start a new project and organize your team's work",
    },
    {
      title: "View Tasks",
      icon: FileText,
      onClick: handleViewTasks,
      description: "Track and manage your ongoing tasks",
    },
    {
      title: "Team Performance",
      icon: TrendingUp,
      onClick: handleTeamPerformance,
      description: "Analyze team productivity and progress",
    },
    {
      title: "Completed Projects",
      icon: CheckCircle2,
      onClick: handleCompletedProjects,
      description: "Review and celebrate completed projects",
    },
    {
      title: "Project List",
      icon: Briefcase,
      onClick: handleViewProjectList,
      description: "View all projects",
    },
  ];

  return (
    <div className="container h-full w-[100%] bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {quickActionCards.map((card, index) => (
          <div 
            key={index} 
            onClick={card.onClick}
            className={cn(
              "group cursor-pointer flex items-center space-x-4 rounded-lg p-4 shadow-md transition-all duration-300",
              "bg-white hover:bg-blue-50 dark:bg-dark-secondary dark:hover:bg-blue-900/20",
              "transform hover:-translate-y-1 hover:scale-105"
            )}
          >
            <card.icon 
              className={cn(
                "h-10 w-10 text-blue-500 group-hover:text-blue-600",
                "dark:text-blue-300 dark:group-hover:text-blue-200"
              )} 
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                {card.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-300" />
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white flex items-center">
            <Briefcase className="mr-2 h-5 w-5 text-green-500 dark:text-green-300" />
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-dark-secondary md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleViewTasks}
            >
              View All Tasks
            </Button>
          </div>
          <h3 className="mb-4 text-lg font-semibold dark:text-white flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-500 dark:text-purple-300" />
            Your Tasks
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
      </div>

      <ModalNewProject 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
      /> 
      <ProjectListModal 
        isOpen={isProjectListModalOpen} 
        onClose={() => setIsProjectListModalOpen(false)} 
        projects={projects || []}
      />
    </div> 
  );
};

export default HomePage;
