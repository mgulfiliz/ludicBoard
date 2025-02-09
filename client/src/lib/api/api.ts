import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { 
  Project, 
  Priority, 
  Status, 
  User, 
  Attachment, 
  Comment, 
  Task, 
  SearchResults, 
  Team 
} from "@/types";
import { setCredentials, clearCredentials } from '../features/authSlice';

export { Priority, Status };
export type { Task, User, Project, Comment, Attachment, SearchResults, Team };

export const CACHE_TAGS = {
  Projects: 'Projects',
  Tasks: 'Tasks',
  Users: 'Users',
  Teams: 'Teams',
  Comments: 'Comments',
  Auth: 'Auth'
} as const;

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
}

// Error Response Type
export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const prepareAuthHeaders = (headers: Headers) => {
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

const transformUserData = (user?: Partial<User>) => user || { 
  userId: 0,
  username: 'Unknown User',
  email: '',
  profilePictureUrl: undefined 
};

// Helper function to extract error message
const extractErrorMessage = (error: FetchBaseQueryError): string => {
  if (error.data && typeof error.data === 'object' && 'message' in error.data) {
    return (error.data as ErrorResponse).message;
  }
  return 'An unexpected error occurred';
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: Object.values(CACHE_TAGS),
  endpoints: (build) => ({
    // Authentication Endpoints
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      }),
      transformErrorResponse: (error: FetchBaseQueryError) => {
        const errorMessage = extractErrorMessage(error);
        return {
          status: error.status,
          error: errorMessage,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ 
            user: {
              userId: data.userId,
              username: data.username,
              email: data.email,
              profilePictureUrl: undefined
            }, 
            token: data.token 
          }));
        } catch {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: [CACHE_TAGS.Auth]
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'GET'
      }),
      transformErrorResponse: (error: FetchBaseQueryError) => {
        const errorMessage = extractErrorMessage(error);
        return {
          status: error.status,
          error: errorMessage,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: [CACHE_TAGS.Auth]
    }),

    getCurrentUser: build.query<User | null, void>({
      query: () => '/auth/me',
      providesTags: [CACHE_TAGS.Auth],
      transformResponse: (response: User | null) => {
        // If no token or unauthorized, return null
        if (!localStorage.getItem('token')) {
          return null;
        }
        return response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setCredentials({ 
              user: data, 
              token: localStorage.getItem('token')! 
            }));
          }
        } catch {
          dispatch(clearCredentials());
        }
      },
      transformErrorResponse: (error: FetchBaseQueryError) => {
        // Silently handle unauthorized errors
        if (error.status === 401) {
          localStorage.removeItem('token');
        }
        return null;
      }
    }),

    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      }),
      transformErrorResponse: (error: FetchBaseQueryError) => {
        const errorMessage = extractErrorMessage(error);
        return {
          status: error.status,
          error: errorMessage,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ 
            user: {
              userId: data.userId,
              username: data.username,
              email: data.email,
              profilePictureUrl: undefined
            }, 
            token: data.token 
          }));
        } catch {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: [CACHE_TAGS.Auth]
    }),

    updateProfile: build.mutation<AuthResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/update-profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [CACHE_TAGS.Users, CACHE_TAGS.Auth],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update the credentials with the new user data
          dispatch(
            setCredentials({
              user: {
                userId: data.userId,
                username: data.username,
                email: data.email
              },
              token: data.token
            })
          );
        } catch (error) {
          console.error('Profile update failed', error);
        }
      },
    }),

    changePassword: build.mutation<{ message: string; token: string; user: User }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update the token and user in the store
          dispatch(
            setCredentials({
              token: data.token,
              user: data.user
            })
          );
        } catch (error) {
          console.error('Password change failed', error);
        }
      },
    }),

    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: CACHE_TAGS.Projects, id })),
              { type: CACHE_TAGS.Projects, id: 'LIST' },
            ]
          : [{ type: CACHE_TAGS.Projects, id: 'LIST' }],
    }),
    getProject: build.query<Project, number>({
      query: (projectId) => `projects/${projectId}`,
      providesTags: (result, error, projectId) => 
        result 
          ? [{ type: CACHE_TAGS.Projects, id: projectId }]
          : [],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: [CACHE_TAGS.Projects],
      transformResponse: (response: Project) => ({
        ...response,
        createdAt: new Date().toISOString()
      }),
    }),
    updateProject: build.mutation<Project, { projectId: number; project: Partial<Project> }>({
      query: ({ projectId, project }) => ({
        url: `projects/${projectId}`,
        method: "PATCH",
        body: project,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: CACHE_TAGS.Projects, id: projectId },
        CACHE_TAGS.Tasks,
      ],
    }),
    deleteProject: build.mutation<void, { projectId: number }>({
      query: ({ projectId }) => ({
        url: `projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: CACHE_TAGS.Projects, id: projectId },
        CACHE_TAGS.Tasks,
        CACHE_TAGS.Users,
        CACHE_TAGS.Teams,
      ],
    }),
    getTasks: build.query<Task[], { projectId?: number; userId?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.projectId) queryParams.append('projectId', params.projectId.toString());
        if (params.userId) queryParams.append('userId', params.userId.toString());
        return `tasks?${queryParams.toString()}&include=comments.user,assignee,author`;
      },
      transformResponse: (response: Task[]) => response.map(task => ({
        ...task,
        comments: (task.comments || []).map(comment => ({
          ...comment,
          user: comment.user || { 
            userId: comment.userId, 
            username: `User ${comment.userId}`,
            email: '',
            profilePictureUrl: undefined 
          },
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
        }))
      })),
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: CACHE_TAGS.Tasks, id })),
              { type: CACHE_TAGS.Tasks, id: 'LIST' },
            ]
          : [{ type: CACHE_TAGS.Tasks, id: 'LIST' }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: CACHE_TAGS.Tasks, id }))
          : [{ type: CACHE_TAGS.Tasks, id: userId }],
    }),
    getTask: build.query<Task, number>({
      query: (taskId) => `tasks/${taskId}?include=comments.user,assignee,author`,
      transformResponse: (response: Task) => ({
        ...response,
        comments: (response.comments || []).map(comment => ({
          ...comment,
          user: comment.user || { 
            userId: comment.userId, 
            username: `User ${comment.userId}`,
            email: '',
            profilePictureUrl: undefined 
          },
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
        }))
      }),
      providesTags: (result, error, taskId) => 
        result 
          ? [{ type: CACHE_TAGS.Tasks, id: taskId }]
          : [],
    }),
    createTask: build.mutation<{ taskId: number, assignedUserIds?: number[] }, Partial<Task>>({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: {
          ...taskData,
          // Ensure backward compatibility
          assignedUserId: taskData.assignedUserIds && taskData.assignedUserIds.length > 0 
            ? taskData.assignedUserIds[0] 
            : undefined,
        }
      }),
      invalidatesTags: [CACHE_TAGS.Tasks],
      transformResponse: (response: Task) => ({
        ...response,
        createdAt: new Date().toISOString()
      }),
    }),
    updateTask: build.mutation<{ assignedUserIds?: number[] } & Task, { taskId: number; task: Partial<Task> }>({
      query: ({ taskId, task }) => ({
        url: `/tasks/${taskId}`,
        method: 'PATCH',
        body: {
          ...task,
          // Ensure backward compatibility
          assignedUserId: task.assignedUserIds && task.assignedUserIds.length > 0 
            ? task.assignedUserIds[0] 
            : undefined,
        }
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: CACHE_TAGS.Tasks, id: taskId },
        CACHE_TAGS.Projects,
      ],
    }),
    deleteTask: build.mutation<void, { taskId: number }>({
      query: ({ taskId }) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: CACHE_TAGS.Tasks, id: taskId },
        CACHE_TAGS.Projects,
      ],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: CACHE_TAGS.Tasks, id: taskId },
      ],
      transformResponse: (response: Task) => ({
        ...response,
        statusUpdatedAt: new Date().toISOString()
      }),
    }),
    getUserProfile: build.query<User & { 
      team?: { teamName: string }, 
      role?: string 
    }, void>({
      query: () => 'users/profile',
      providesTags: [CACHE_TAGS.Users],
    }),
    updateUserProfile: build.mutation<User, Partial<User>>({
      query: (updates) => ({
        url: 'users/profile',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: [CACHE_TAGS.Users],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: (result) => 
        result
          ? result.map(({ userId }) => ({ type: CACHE_TAGS.Users, id: userId }))
          : [],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: (result) => 
        result
          ? result.map(({ teamId }) => ({ type: CACHE_TAGS.Teams, id: teamId }))
          : [],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
    createComment: build.mutation<Comment, { taskId: number; text: string; userId?: number }>({
      query: ({ taskId, text, userId }) => ({
        url: `tasks/${taskId}/comments`,
        method: 'POST',
        body: { text, ...(userId ? { userId } : {}) },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: CACHE_TAGS.Tasks, id: taskId },
        CACHE_TAGS.Comments,
      ],
      async onQueryStarted({ taskId }, { dispatch, queryFulfilled }) {
        try {
          const { data: newComment } = await queryFulfilled;
          dispatch(
            api.util.updateQueryData('getTasks', { projectId: undefined }, draft => {
              const task = draft.find(t => t.id === taskId);
              if (task) {
                if (!task.comments) task.comments = [];
                task.comments.unshift(newComment);
              }
            })
          );
        } catch {}
      }
    }),
    editComment: build.mutation<Comment, { commentId: number; text: string }>({
      query: ({ commentId, text }) => ({
        url: `tasks/comments/${commentId}`,
        method: 'PATCH',
        body: { text },
      }),
      invalidatesTags: () => [
        { type: CACHE_TAGS.Tasks, id: 'LIST' },
        CACHE_TAGS.Comments,
      ],
      transformResponse: (response: Comment) => ({
        ...response,
        user: response.user || { 
          userId: response.userId, 
          username: `User ${response.userId}`,
          email: '',
          profilePictureUrl: undefined 
        },
        updatedAt: new Date().toISOString(),
        createdAt: response.createdAt || new Date().toISOString()
      }),
    }),
    deleteComment: build.mutation<Comment, { commentId: number }>({
      query: ({ commentId }) => ({
        url: `tasks/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: CACHE_TAGS.Tasks },
        { type: CACHE_TAGS.Comments, id: commentId }
      ],
      transformResponse: (response: Comment) => ({
        ...response,
        deletedAt: new Date().toISOString()
      }),
    }),
  }),
});

// Export hooks for authentication and existing endpoints
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useGetTasksByUserQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useGetUsersQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetTeamsQuery,
  useSearchQuery,
  useCreateCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = api;