import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  const tasks = await prisma.task.findMany({
    where: {
      projectId: Number(projectId),
    },
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
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      tags,
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

  res.status(201).json(newTask);
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    assignedUserId,
  } = req.body;

  const updatedTask = await prisma.task.update({
    where: { id: Number(taskId) },
    data: {
      title,
      description,
      status,
      priority,
      tags,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points,
      assignee: assignedUserId 
        ? { connect: { userId: assignedUserId } } 
        : { disconnect: true },
    },
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

  res.json(updatedTask);
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

  await prisma.task.delete({
    where: { id: Number(taskId) },
  });

  res.status(204).send();
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { text, userId } = req.body;

  if (!text || !userId || !taskId) {
    throw new AppError('Invalid input. Text, userId, and taskId are required.', 400);
  }

  const newComment = await prisma.comment.create({
    data: {
      text,
      userId: parseInt(userId, 10),
      taskId: parseInt(taskId, 10)
    },
    include: { user: true }
  });

  res.status(201).json(newComment);
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  await prisma.comment.delete({
    where: { id: parseInt(commentId, 10) }
  });

  res.status(204).send();
};

export const editComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { text } = req.body;

  const updatedComment = await prisma.comment.update({
    where: { id: parseInt(commentId, 10) },
    data: { text },
    include: { user: true }
  });

  res.json(updatedComment);
};