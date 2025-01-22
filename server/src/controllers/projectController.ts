import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate,
        endDate,
      },
    });
    res.status(201).json(newProject);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};

export const deleteProject = async (
  req: Request, 
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({
        where: { projectId: Number(projectId) },
      });

      await tx.project.delete({
        where: { id: Number(projectId) },
      });
    });

    res.status(200).json({ message: `Project ${projectId} and related content deleted successfully.` });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error deleting project: ${error.message}` });
  }
};
