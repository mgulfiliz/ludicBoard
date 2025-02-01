/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string | null;
  dueDate?: string | null;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

interface ApiErrorResponse {
  status?: number | string;
  data?: {
    message?: string;
  };
}

export function handleApiError(
  error: FetchBaseQueryError | ApiErrorResponse, 
  defaultMessage = 'An unexpected error occurred'
) {
  const hasData = (err: any): err is { data?: { message?: string } } => 
    err && typeof err === 'object' && 'data' in err;

  const hasMessage = (err: any): err is { message?: string } => 
    err && typeof err === 'object' && 'message' in err;

  if (hasData(error) && error.data && 'message' in error.data) {
    return {
      status: error.status?.toString() || 'ERROR',
      error: error.data.message || defaultMessage,
    };
  }

  if (hasMessage(error)) {
    return {
      status: error.status?.toString() || 'ERROR',
      error: error.message || defaultMessage,
    };
  }

  return {
    status: 'ERROR',
    error: defaultMessage,
  };
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL 
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "Comments"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
      transformErrorResponse: (response) => handleApiError(response, 'Failed to fetch projects'),
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Project creation failed'),
      invalidatesTags: ["Projects"],
      transformResponse: (response: Project) => ({
        ...response,
        createdAt: new Date().toISOString()
      }),
    }),
    deleteProject: build.mutation<void, { projectId: number }>({
      query: ({ projectId }) => ({
        url: `projects/${projectId}`,
        method: 'DELETE',
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Project deletion failed'),
      invalidatesTags: ['Projects', 'Tasks', 'Users', 'Teams'],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}&include=comments.user,assignee,author`,
      transformResponse: (response: Task[]) => {
        return response.map(task => ({
          ...task,
          comments: task.comments?.map(comment => ({
            ...comment,
            user: comment.user 
              ? {
                  ...comment.user,
                  profilePictureUrl: comment.user.profilePictureUrl 
                    ? (comment.user.profilePictureUrl.startsWith('/') 
                      ? comment.user.profilePictureUrl 
                      : `/${comment.user.profilePictureUrl}`)
                    : undefined,
                  username: comment.user.username || `User ${comment.userId}`
                }
              : { 
                  userId: comment.userId, 
                  username: `User ${comment.userId}`,
                  email: '',
                  profilePictureUrl: undefined 
                },
            createdAt: comment.createdAt || new Date().toISOString(),
            updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
          })) || []
        }));
      },
      transformErrorResponse: (response) => handleApiError(response, 'Failed to fetch tasks'),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      transformErrorResponse: (response) => handleApiError(response, 'Failed to fetch user tasks'),
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Task creation failed'),
      invalidatesTags: ["Tasks"],
      transformResponse: (response: Task) => ({
        ...response,
        createdAt: new Date().toISOString()
      }),
    }),
    updateTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: `tasks/${task.id}`,
        method: "PATCH",
        body: task,
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Task update failed'),
      invalidatesTags: ["Tasks"],
      transformResponse: (response: Task) => ({
        ...response,
        updatedAt: new Date().toISOString()
      }),
    }),
    deleteTask: build.mutation<void, { taskId: number }>({
      query: ({ taskId }) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Task deletion failed'),
      invalidatesTags: ["Tasks"],
    }), 
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Task status update failed'),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
      transformResponse: (response: Task) => ({
        ...response,
        statusUpdatedAt: new Date().toISOString()
      }),
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      transformErrorResponse: (response) => handleApiError(response, 'Failed to fetch users'),
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      transformErrorResponse: (response) => handleApiError(response, 'Failed to fetch teams'),
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
      transformErrorResponse: (response) => handleApiError(response, 'Failed to perform search'),
    }),
    createComment: build.mutation<Comment, { taskId: number; text: string; userId: number }>({
      query: ({ taskId, text, userId }) => ({
        url: `tasks/${taskId}/comments`, 
        method: 'POST',
        body: { text, userId },
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Comment creation failed'),
      invalidatesTags: (result, error, { taskId }) => [{ type: "Tasks", id: taskId }],
      transformResponse: (response: Comment) => {
        const user = response.user || { 
          userId: response.userId, 
          username: '', 
          email: ''     
        };
        const now = new Date().toISOString();
        return {
          ...response,
          createdAt: response.createdAt || now,
          updatedAt: response.updatedAt || now,
          user: user as User
        };
      },
    }),
    editComment: build.mutation<Comment, { commentId: number; text: string }>({
      query: ({ commentId, text }) => ({
        url: `tasks/comments/${commentId}`, 
        method: 'PATCH',
        body: { text },
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Comment edit failed'),
      invalidatesTags: ['Tasks'],
      transformResponse: (response: Comment) => {
        const now = new Date().toISOString();
        return {
          ...response,
          updatedAt: response.updatedAt || now
        };
      },
    }),
    deleteComment: build.mutation<Comment, { commentId: number }>({
      query: ({ commentId }) => ({
        url: `tasks/comments/${commentId}`, 
        method: 'DELETE',
      }),
      transformErrorResponse: (response) => handleApiError(response, 'Comment deletion failed'),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Tasks" },
        { type: "Comments", id: commentId }
      ],
      transformResponse: (response: Comment) => ({
        ...response,
        deletedAt: new Date().toISOString()
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useCreateCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = api;
