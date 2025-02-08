import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchableItem {
  title?: string;
  name?: string;
  username?: string;
  description?: string | null;
}

const calculateRelevanceScore = (item: SearchableItem, query: string): number => {
  const queryLower = query.toLowerCase();
  let score = 0;

  const fieldsToCheck: (keyof SearchableItem)[] = ['title', 'name', 'username', 'description'];

  for (const field of fieldsToCheck) {
    const value = item[field]?.toLowerCase();
    if (!value) continue;

    if (value === queryLower) {
      score += 100;
    } else if (value.startsWith(queryLower)) {
      score += 50;
    } else if (value.includes(queryLower)) {
      score += 10;
    }
  }

  return score;
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { query } = req.query;

  if (typeof query !== 'string' || query.trim().length < 2) {
    res.json({ tasks: [], projects: [], users: [] });
    return;
  }

  const queryString = query.trim();

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: queryString, mode: 'insensitive' } },
          { description: { contains: queryString, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: queryString, mode: 'insensitive' } },
          { description: { contains: queryString, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: queryString, mode: 'insensitive' } },
          { email: { contains: queryString, mode: 'insensitive' } },
        ] as Prisma.UserWhereInput['OR']
      },
      take: 10,
    });

    const sortedTasks = tasks.sort((a, b) => 
      calculateRelevanceScore(b, queryString) - calculateRelevanceScore(a, queryString)
    );

    const sortedProjects = projects.sort((a, b) => 
      calculateRelevanceScore(b, queryString) - calculateRelevanceScore(a, queryString)
    );

    const sortedUsers = users
      .map(user => ({
        ...user,
        name: user.name || undefined
      }))
      .sort((a, b) => 
        calculateRelevanceScore(b, queryString) - calculateRelevanceScore(a, queryString)
      );

    res.json({ 
      tasks: sortedTasks, 
      projects: sortedProjects, 
      users: sortedUsers 
    });
  } catch (error) {
    next(error);
  }
};