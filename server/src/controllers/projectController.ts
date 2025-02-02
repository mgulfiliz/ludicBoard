import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const projects = await prisma.project.findMany();
  res.json(projects);
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  const newProject = await prisma.project.create({
    data: {
      name,
      description,
      startDate,
      endDate,
    },
  });
  res.status(201).json(newProject);
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(projectId, 10) },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id: parseInt(projectId, 10) },
  });

  res.status(204).send();
};