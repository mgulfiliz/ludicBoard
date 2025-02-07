import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  const tasks = await prisma.task.findMany({
    where: { projectId: Number(projectId) },
    include: {
      author: true,
      assignee: true,
      comments: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true,
            }
          }
        }
      },
      attachments: true,
    },
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
  const {
    title, description, status, priority, tags,
    startDate, dueDate, points, assignedUserId,
  } = req.body;

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: {
      title, description, status, priority, tags,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points,
      assignee: assignedUserId 
        ? { connect: { userId: assignedUserId } } 
        : { disconnect: true },
    },
  });

  res.json({ taskId: updatedTask.id });
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
  const { taskId } = req.params;
  const { text, userId } = req.body;

  try {
    if (!text || !userId || !taskId) 
      throw new AppError('Invalid input. Text, userId, and taskId are required.', 400);

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
      select: { id: true }
    });

    if (!existingTask) 
      throw new AppError(`Task with ID ${taskId} not found`, 404);

    const newComment = await prisma.comment.create({
      data: {
        text,
        userId: parseInt(userId, 10),
        taskId: parseInt(taskId, 10)
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

    res.status(201).json({ commentId: newComment.id });
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

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const commentIdNum = parseInt(commentId, 10);

  try {
    if (isNaN(commentIdNum)) 
      throw new AppError('Invalid comment ID', 400);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      select: { id: true }
    });

    if (!existingComment) 
      throw new AppError(`Comment with ID ${commentId} not found`, 404);

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

export const editComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { text } = req.body;
  const commentIdNum = parseInt(commentId, 10);

  try {
    if (!text) 
      throw new AppError('Comment text is required', 400);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
      select: { id: true }
    });

    if (!existingComment) 
      throw new AppError(`Comment with ID ${commentId} not found`, 404);

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

    res.json({ commentId: updatedComment.id });
  } catch (error) {
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