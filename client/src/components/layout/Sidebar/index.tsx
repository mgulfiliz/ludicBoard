"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/lib/api";
import { useGetProjectsQuery } from "@/lib/api/api";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Edit,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  Trash,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDeleteProjectMutation } from "@/lib/api/api";
import CustomMenu from "@/components/common/CustomMenu";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
 
  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [deleteProject] = useDeleteProjectMutation();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed top-0 left-0 flex flex-col h-full justify-between shadow-xl
    transition-all duration-300 z-40 dark:bg-neutral-900 bg-neutral-100 border-r border-gray-200 dark:border-neutral-700
    ${isSidebarCollapsed ? "w-16" : "w-64"} ${isSidebarCollapsed ? "overflow-hidden" : "overflow-y-auto"}`;

  const linkClassName = (collapsed: boolean) => `
    flex items-center p-3 hover:bg-gray-200 dark:hover:bg-neutral-700 
    ${collapsed ? "justify-center" : "justify-start gap-3"}
    text-gray-700 dark:text-gray-100
  `;

  const iconClassName = "h-5 w-5 text-gray-600 dark:text-gray-200";

  const generateProjectActions = (projectId: number, projectName: string) => {
    return [
      {
        label: 'View Project',
        icon: Briefcase,
        onClick: () => router.push(`/projects/${projectId}`),
        variant: 'default' as const,
      },
      {
        label: 'Edit Project',
        icon: Edit,
        onClick: () => {
          // TODO: Implement edit project modal/navigation
          toast.info(`Edit project ${projectName} functionality not yet implemented`);
        },
        variant: 'default' as const,
      },
      {
        label: 'Duplicate Project',
        icon: Copy,
        onClick: () => {
          // TODO: Implement project duplication
          toast.info(`Duplicate project ${projectName} functionality not yet implemented`);
        },
        variant: 'default' as const,
      },
      {
        label: 'Delete Project',
        icon: Trash,
        onClick: async () => {
          try {
            await deleteProject({ projectId }).unwrap();
            toast.success(`Project ${projectName} deleted successfully`);
            router.push('/');  
          } catch (error) {
            toast.error(`Failed to delete project ${projectName}`);
          }
        },
        variant: 'destructive' as const,
        confirmationTitle: 'Delete Item',
        confirmationMessage: 'Are you sure you want to delete this item?'
      }
    ];
  };

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* TOP LOGO/TOGGLE */}
        <div className="flex items-center justify-center min-h-[56px] border-b border-gray-200 dark:border-neutral-800">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
            aria-label="Toggle Sidebar"
          >
            <Layers3 className={iconClassName} />
          </button>
        </div>

        {/* NAVBAR LINKS */}
        <nav className="w-full">
          <Link href="/" className={linkClassName(isSidebarCollapsed)}>
            <Home className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Home</span>}
          </Link>
          <Link href="/timeline" className={linkClassName(isSidebarCollapsed)}>
            <Briefcase className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Timeline</span>}
          </Link>
          <Link href="/search" className={linkClassName(isSidebarCollapsed)}>
            <Search className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Search</span>}
          </Link>
          <Link href="/settings" className={linkClassName(isSidebarCollapsed)}>
            <Settings className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Settings</span>}
          </Link>
          <Link href="/users" className={linkClassName(isSidebarCollapsed)}>
            <User className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Users</span>}
          </Link>
          <Link href="/teams" className={linkClassName(isSidebarCollapsed)}>
            <Users className={iconClassName} />
            {!isSidebarCollapsed && <span className="text-sm">Teams</span>}
          </Link>
        </nav>

        {/* PROJECTS SECTION */}
        {!isSidebarCollapsed && (
          <>
            <button
              onClick={() => setShowProjects((prev) => !prev)}
              className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
            >
              <span className="">Projects</span>
              {showProjects ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {showProjects &&
            projects?.map((project) => (
              <div 
                key={project.id} 
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Link 
                  href={`/projects/${project.id}`} 
                  className="flex items-center justify-start gap-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  <Briefcase className={iconClassName} />
                  <span className="text-sm text-gray-800 dark:text-gray-100">{project.name}</span>
                </Link>
                <CustomMenu 
                  actions={generateProjectActions(project.id, project.name)}
                  buttonClassName="mr-4"
                />
              </div>
            ))}
          </>
        )}

        {/* PRIORITIES SECTION */}
        {!isSidebarCollapsed && (
          <>
            <button
              onClick={() => setShowPriority((prev) => !prev)}
              className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
            >
              <span className="">Priority</span>
              {showPriority ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {showPriority && (
              <>
                <Link href="/priority/urgent" className="flex items-center justify-start gap-3 p-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <AlertCircle className={iconClassName} />
                  <span className="text-sm">Urgent</span>
                </Link>
                <Link href="/priority/high" className="flex items-center justify-start gap-3 p-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <ShieldAlert className={iconClassName} />
                  <span className="text-sm">High</span>
                </Link>
                <Link href="/priority/medium" className="flex items-center justify-start gap-3 p-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <AlertTriangle className={iconClassName} />
                  <span className="text-sm">Medium</span>
                </Link>
                <Link href="/priority/low" className="flex items-center justify-start gap-3 p-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <AlertOctagon className={iconClassName} />
                  <span className="text-sm">Low</span>
                </Link>
                <Link href="/priority/backlog" className="flex items-center justify-start gap-3 p-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <Layers3 className={iconClassName} />
                  <span className="text-sm">Backlog</span>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
