import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

export { Priority, Status };
export type { Task, User, Project, Comment, Attachment, SearchResults, Team };

export const CACHE_TAGS = {
  Projects: 'Projects',
  Tasks: 'Tasks',
  Users: 'Users',
  Teams: 'Teams',
  Comments: 'Comments',
} as const;

const prepareAuthHeaders = (headers: Headers) => {
  const token = localStorage.getItem('authToken');
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

const transformCommentData = (comment: Comment) => ({
  ...comment,
  user: transformUserData(comment.user),
  createdAt: comment.createdAt || new Date().toISOString(),
  updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
});

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: prepareAuthHeaders,
  }),
  reducerPath: "api",
  tagTypes: Object.values(CACHE_TAGS),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
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
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: [CACHE_TAGS.Tasks, CACHE_TAGS.Projects],
      transformResponse: (response: Task) => ({
        ...response,
        createdAt: new Date().toISOString()
      }),
    }),
    updateTask: build.mutation<Task, { taskId: number; task: Partial<Task> }>({
      query: ({ taskId, task }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: task,
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
    createComment: build.mutation<Comment, { taskId: number; text: string; userId: number }>({
      query: ({ taskId, text, userId }) => ({
        url: `tasks/${taskId}/comments`,
        method: 'POST',
        body: { text, userId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: CACHE_TAGS.Tasks, id: taskId },
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
        createdAt: response.createdAt || new Date().toISOString(),
      }),
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

export const {
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