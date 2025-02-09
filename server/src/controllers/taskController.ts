import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
const prisma = new PrismaClient();

// Define an interface for the authenticated user in the request
interface AuthenticatedRequest extends Request {
  user?: User;
  userTaskPermission?: string;
}

interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: number;
}

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { projectId } = req.query;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Only return tasks from projects user is a member of
  const tasks = await prisma.task.findMany({
    where: { 
      projectId: Number(projectId),
      project: {
        memberships: {
          some: { 
            userId,
            role: { in: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] }
          }
        }
      }
    },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true
        }
      },
      assignee: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true
        }
      },
      taskAssignments: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true
            }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true
            }
          }
        }
      },
      attachments: true
    }
  });

  // Transform tasks to include assignedUserIds
  const transformedTasks = tasks.map(task => ({
    ...task,
    assignedUserIds: task.taskAssignments.map(assignment => assignment.user.userId),
    assignees: task.taskAssignments.map(assignment => assignment.user)
  }));

  res.json(transformedTasks);
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    title, description, status, priority, tags,
    startDate, dueDate, points, projectId,
    authorUserId, assignedUserIds,
  } = req.body;

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Ensure the authenticated user is creating the task or is authorized to do so
  if (authorUserId && userId !== authorUserId) {
    throw new AppError('You can only create tasks for yourself', 403);
  }

  // If no authorUserId is provided, use the authenticated user's ID
  const finalAuthorUserId = authorUserId || userId;

  try {
    // Check if the user is a member of the project
    const projectMembership = await prisma.projectMembership.findFirst({
      where: {
        projectId: Number(projectId),
        userId: finalAuthorUserId,
        role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
      }
    });

    if (!projectMembership) {
      throw new AppError('You do not have permission to create a task in this project', 403);
    }

    // Prepare task creation data
    const taskData: Prisma.TaskCreateInput = {
      title, 
      description, 
      status, 
      priority, 
      tags: tags || [],
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points,
      project: { connect: { id: Number(projectId) } },
      author: { connect: { userId: finalAuthorUserId } },
      assignee: assignedUserIds && assignedUserIds.length > 0 
        ? { connect: { userId: Number(assignedUserIds[0]) } }
        : undefined,
    };

    const newTask = await prisma.task.create({
      data: taskData,
      include: {
        taskAssignments: {
          include: {
            user: true
          }
        }
      }
    });

    // Create task assignments if multiple users are selected
    if (assignedUserIds && assignedUserIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assignedUserIds.map((assignedUserId: number) => ({
          taskId: newTask.id,
          userId: Number(assignedUserId)
        }))
      });
    }

    // Fetch the updated task with assignments
    const updatedTask = await prisma.task.findUnique({
      where: { id: newTask.id },
      include: {
        taskAssignments: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(201).json({ 
      taskId: updatedTask!.id,
      assignedUserIds: updatedTask!.taskAssignments.map(assignment => assignment.user.userId)
    });
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while creating the task', 
        500
      );
    }
    throw error;
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const userId = req.user?.userId;
  const userTaskPermission = req.userTaskPermission;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Restrict update based on permission
  if (userTaskPermission === 'VIEW') {
    res.status(403).json({ message: 'You cannot update this task' });
    return;
  }

  const { assignedUserIds, ...otherUpdateData } = req.body;

  // Prepare the update data object
  const updateData: Prisma.TaskUpdateInput = {
    ...otherUpdateData,
    // Always set assignedUserId to null when no assignees
    assignedUserId: assignedUserIds && assignedUserIds.length > 0 
      ? Number(assignedUserIds[0]) 
      : null,
  };

  // Handle task assignments separately
  if (assignedUserIds) {
    // If assignedUserIds is an empty array, delete all assignments
    // If assignedUserIds has values, create new assignments
    updateData.taskAssignments = assignedUserIds.length > 0 
      ? { 
          deleteMany: {}, 
          create: assignedUserIds.map((userId: number) => ({
            user: { connect: { userId: Number(userId) } }
          }))
        }
      : { deleteMany: {} };
  }

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: updateData,
    include: {
      taskAssignments: {
        include: {
          user: true
        }
      }
    }
  });

  // Explicitly return an empty assignedUserIds array when no assignments
  res.json({ 
    ...updatedTask,
    assignedUserIds: updatedTask.taskAssignments.map(assignment => assignment.user.userId)
  });
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: { status },
  });

  res.json({ taskId: updatedTask.id });
};

export const getUserTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId) {
    throw new AppError('User not authenticated', 401);
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { authorUserId: Number(userId) },
        { assignedUserId: Number(userId) },
        { taskAssignments: { some: { userId: Number(userId) } } }
      ],
    },
    include: {
      project: true,
      author: true,
      assignee: true,
      taskAssignments: {
        include: {
          user: true
        }
      }
    },
  });

  // Transform tasks to include assignedUserIds
  const transformedTasks = tasks.map(task => ({
    ...task,
    assignedUserIds: task.taskAssignments.map(assignment => assignment.user.userId),
    assignees: task.taskAssignments.map(assignment => assignment.user)
  }));

  res.json(transformedTasks);
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const taskIdNum = Number(taskId);
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  try {
    if (isNaN(taskIdNum)) throw new AppError('Invalid task ID', 400);

    const existingTask = await prisma.task.findUnique({
      where: { id: taskIdNum },
      select: { id: true }
    });

    if (!existingTask) throw new AppError(`Task with ID ${taskId} not found`, 404);

    await prisma.taskAssignment.deleteMany({ where: { taskId: taskIdNum } });
    await prisma.comment.deleteMany({ where: { taskId: taskIdNum } });
    await prisma.attachment.deleteMany({ where: { taskId: taskIdNum } });
    await prisma.task.delete({ where: { id: taskIdNum } });

    res.status(200).json({ taskId: taskIdNum });
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while deleting the task', 
        500
      );
    }
    throw error;
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  // Handle both text and content from the request body
  const text = req.body.text || req.body.content;
  const { userId } = req.body;
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId) {
    throw new AppError('User not authenticated', 401);
  }

  try {
    // Use the authenticated user's ID if not provided
    const commentUserId: number = userId || authenticatedUserId;

    if (!text || !commentUserId || !taskId) {
      throw new AppError('Invalid input. Text, userId, and taskId are required.', 400);
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
      select: { id: true }
    });

    if (!existingTask) {
      throw new AppError(`Task with ID ${taskId} not found`, 404);
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        task: { connect: { id: parseInt(taskId, 10) } },
        user: { connect: { userId: commentUserId } }
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true
          }
        }
      }
    });

    res.status(201).json(newComment);
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while creating the comment', 
        500
      );
    }
    throw error;
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const commentIdNum = parseInt(commentId, 10);
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  try {
    if (isNaN(commentIdNum)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      select: { userId: true }
    });

    if (!existingComment) {
      throw new AppError(`Comment with ID ${commentId} not found`, 404);
    }

    // Check if the user is the comment author
    if (existingComment.userId !== userId) {
      throw new AppError('You can only delete your own comments', 403);
    }

    await prisma.comment.delete({ where: { id: commentIdNum } });

    res.status(200).json({ commentId: commentIdNum });
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while deleting the comment', 
        500
      );
    }
    throw error;
  }
};

export const editComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { text } = req.body;
  const commentIdNum = parseInt(commentId, 10);
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  try {
    if (!text) {
      throw new AppError('Comment text is required', 400);
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      select: { userId: true }
    });

    if (!existingComment) {
      throw new AppError(`Comment with ID ${commentId} not found`, 404);
    }

    // Check if the user is the comment author
    if (existingComment.userId !== userId) {
      throw new AppError('You can only edit your own comments', 403);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentIdNum },
      data: { text },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true
          }
        }
      }
    });

    res.json(updatedComment);
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while editing the comment', 
        500
      );
    }
    throw error;
  }
};