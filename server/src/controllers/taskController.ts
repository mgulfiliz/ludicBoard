import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
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
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving tasks: ${error.message}` });
  }
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
  try {
    const newTask = await prisma.task.create({
      data: {
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
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error creating a task: ${error.message}` });
  }
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
    authorUserId,
    assignedUserId,
  } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        authorUserId,
        assignedUserId,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
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
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving user tasks: ${error.message}` });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    await prisma.task.delete({
      where: {
        id: Number(taskId),
      },
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { text, userId } = req.body;

  try {
    if (!text || !userId || !taskId) {
      res.status(400).json({ 
        message: 'Invalid input. Text, userId, and taskId are required.',
        details: { text, userId, taskId }
      });
      return;
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
  } catch (error: any) {
    res.status(500).json({ message: `Error creating comment: ${error.message}` });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  try {
    const deletedComment = await prisma.comment.delete({
      where: { id: parseInt(commentId, 10) }
    });

    res.status(200).json(deletedComment);
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting comment: ${error.message}` });
  }
};

export const editComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { text } = req.body;

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId, 10) },
      data: { text },
      include: { user: true }
    });

    res.status(200).json(updatedComment);
  } catch (error: any) {
    res.status(500).json({ message: `Error editing comment: ${error.message}` });
  }
};