import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const projects = await prisma.project.findMany();
  res.json(projects);
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  const newProject = await prisma.project.create({
    data: { name, description, startDate, endDate },
  });
  res.status(201).json({ projectId: newProject.id });
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const projectIdNum = parseInt(projectId, 10);

  try {
    if (isNaN(projectIdNum)) throw new AppError('Invalid project ID', 400);

    const existingProject = await prisma.project.findUnique({
      where: { id: projectIdNum },
      select: { id: true }
    });

    if (!existingProject) throw new AppError(`Project with ID ${projectId} not found`, 404);

    await prisma.taskAssignment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.comment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.attachment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.task.deleteMany({where: { projectId: projectIdNum }});
    await prisma.projectTeam.deleteMany({where: { projectId: projectIdNum }});
    await prisma.project.delete({where: { id: projectIdNum }});

    res.status(200).json({ projectId: projectIdNum });
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw new AppError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while deleting the project', 
        500
      );
    }
    throw error;
  }
};