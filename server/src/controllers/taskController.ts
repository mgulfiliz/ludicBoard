import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  const userId = (req.user as any).userId;

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

  res.json(tasks);
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const {
    title, description, status, priority, tags,
    startDate, dueDate, points, projectId,
    authorUserId, assignedUserId,
  } = req.body;

  const newTask = await prisma.task.create({
    data: {
      title, description, status, priority, tags,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points,
      project: { connect: { id: Number(projectId) } },
      author: { connect: { userId: authorUserId } },
      assignee: assignedUserId 
        ? { connect: { userId: assignedUserId } } 
        : undefined,
    },
  });

  res.status(201).json({ taskId: newTask.id });
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const userId = (req.user as any).userId;
  const userTaskPermission = (req as any).userTaskPermission;

  // Restrict update based on permission
  if (userTaskPermission === 'VIEW') {
    res.status(403).json({ message: 'You cannot update this task' });
    return;
  }

  // If partial permission, limit updatable fields
  const updateData = userTaskPermission === 'PARTIAL' 
    ? { 
        status: req.body.status, 
        assignedUserId: req.body.assignedUserId 
      }
    : req.body;

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: updateData
  });

  res.json(updatedTask);
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: { status },
  });

  res.json({ taskId: updatedTask.id });
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { authorUserId: Number(userId) },
        { assignedUserId: Number(userId) },
      ],
    },
    include: {
      project: true,
      author: true,
      assignee: true,
    },
  });

  res.json(tasks);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const taskIdNum = Number(taskId);

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

export const createComment = async (req: Request, res: Response): Promise<void> => {
  console.log('Create Comment Request:', {
    params: req.params,
    body: req.body,
    user: req.user
  });

  const { taskId } = req.params;
  // Handle both text and content from the request body
  const text = req.body.text || req.body.content;
  const { userId } = req.body;

  try {
    // Use the authenticated user's ID if not provided
    const commentUserId = userId || (req.user as any)?.userId;

    console.log('Resolved User ID:', commentUserId);

    if (!text || !commentUserId || !taskId) {
      console.error('Invalid input:', { text, commentUserId, taskId });
      throw new AppError('Invalid input. Text, userId, and taskId are required.', 400);
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
      select: { id: true }
    });

    if (!existingTask) {
      console.error(`Task with ID ${taskId} not found`);
      throw new AppError(`Task with ID ${taskId} not found`, 404);
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        userId: parseInt(commentUserId, 10),
        taskId: parseInt(taskId, 10)
      },
      include: { 
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true,
            email: true
          }
        } 
      }
    });

    console.log('Comment created successfully:', newComment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
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

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const commentIdNum = parseInt(commentId, 10);
  const userId = (req.user as any)?.userId;

  try {
    if (isNaN(commentIdNum)) 
      throw new AppError('Invalid comment ID', 400);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      include: { 
        task: {
          include: {
            project: {
              include: {
                memberships: {
                  where: { 
                    userId,
                    role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!existingComment) 
      throw new AppError(`Comment with ID ${commentId} not found`, 404);

    // Check if user is comment author, task creator, or project member
    const isCommentAuthor = existingComment.userId === userId;
    const isProjectMember = existingComment.task.project.memberships.length > 0;
    const isTaskCreator = existingComment.task.authorUserId === userId;

    if (!isCommentAuthor && !isProjectMember && !isTaskCreator) {
      throw new AppError('You do not have permission to delete this comment', 403);
    }

    await prisma.comment.delete({ where: { id: commentIdNum } });

    res.status(200).json({ commentId: commentIdNum });
  } catch (error) {
    console.error('Delete comment error:', error);
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

export const editComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { text } = req.body;
  const commentIdNum = parseInt(commentId, 10);
  const userId = (req.user as any)?.userId;

  try {
    if (!text) 
      throw new AppError('Comment text is required', 400);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      include: { 
        task: {
          include: {
            project: {
              include: {
                memberships: {
                  where: { 
                    userId,
                    role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!existingComment) 
      throw new AppError(`Comment with ID ${commentId} not found`, 404);

    // Check if user is comment author, task creator, or project member
    const isCommentAuthor = existingComment.userId === userId;
    const isProjectMember = existingComment.task.project.memberships.length > 0;
    const isTaskCreator = existingComment.task.authorUserId === userId;

    if (!isCommentAuthor && !isProjectMember && !isTaskCreator) {
      throw new AppError('You do not have permission to edit this comment', 403);
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
    console.error('Edit comment error:', error);
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while updating the comment', 
        500
      );
    }
    throw error;
  }
};