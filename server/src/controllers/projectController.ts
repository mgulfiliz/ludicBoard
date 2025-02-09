import { Request, Response } from "express";
import { PrismaClient, ProjectRole } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;

  const projects = await prisma.project.findMany({
    where: {
      memberships: {
        some: {
          userId,
          role: { in: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] }
        }
      }
    },
    include: {
      memberships: {
        select: {
          user: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true
            }
          },
          role: true
        }
      }
    }
  });

  res.json(projects);
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  const userId = (req.user as any).userId;

  const newProject = await prisma.project.create({
    data: { 
      name, 
      description, 
      startDate, 
      endDate,
      memberships: {
        create: {
          userId,
          role: 'OWNER'
        }
      }
    }
  });

  res.status(201).json({ projectId: newProject.id });
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const projectIdNum = parseInt(projectId, 10);
  const userId = (req.user as any).userId;

  try {
    if (isNaN(projectIdNum)) throw new AppError('Invalid project ID', 400);

    // Verify user is owner of the project
    const membership = await prisma.projectMembership.findFirst({
      where: { 
        projectId: projectIdNum, 
        userId,
        role: 'OWNER' 
      }
    });

    if (!membership) throw new AppError('Only project owners can delete the project', 403);

    await prisma.taskAssignment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.comment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.attachment.deleteMany({where: { task: { projectId: projectIdNum } }});
    await prisma.task.deleteMany({where: { projectId: projectIdNum }});
    await prisma.projectTeam.deleteMany({where: { projectId: projectIdNum }});
    await prisma.projectMembership.deleteMany({where: { projectId: projectIdNum }});
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

export const addProjectMember = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  const inviterId = (req.user as any).userId;

  // Validate role
  if (!Object.values(ProjectRole).includes(role)) {
    res.status(400).json({ message: 'Invalid project role' });
    return;
  }

  // Find the user to invite
  const userToInvite = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (!userToInvite) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Check if inviter has permission to add members
  const inviterMembership = await prisma.projectMembership.findFirst({
    where: { 
      projectId: Number(projectId), 
      userId: inviterId,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!inviterMembership) {
    res.status(403).json({ message: 'You do not have permission to add members' });
    return;
  }

  // Check if user is already a member
  const existingMembership = await prisma.projectMembership.findFirst({
    where: { 
      projectId: Number(projectId), 
      userId: userToInvite.userId 
    }
  });

  if (existingMembership) {
    res.status(400).json({ message: 'User is already a member of this project' });
    return;
  }

  // Add user to project
  const newMembership = await prisma.projectMembership.create({
    data: {
      projectId: Number(projectId),
      userId: userToInvite.userId,
      role: role as ProjectRole
    }
  });

  res.status(201).json(newMembership);
};

export const updateProjectMemberRole = async (req: Request, res: Response): Promise<void> => {
  const { projectId, userId } = req.params;
  const { role } = req.body;
  const updaterId = (req.user as any).userId;

  // Validate role
  if (!Object.values(ProjectRole).includes(role)) {
    res.status(400).json({ message: 'Invalid project role' });
    return;
  }

  // Check if updater has permission to change roles
  const updaterMembership = await prisma.projectMembership.findFirst({
    where: { 
      projectId: Number(projectId), 
      userId: updaterId,
      role: 'OWNER' 
    }
  });

  if (!updaterMembership) {
    res.status(403).json({ message: 'Only project owners can change member roles' });
    return;
  }

  // Update member role
  const updatedMembership = await prisma.projectMembership.update({
    where: { 
      projectId_userId: { 
        projectId: Number(projectId), 
        userId: Number(userId) 
      }
    },
    data: { role: role as ProjectRole }
  });

  res.json(updatedMembership);
};

export const removeProjectMember = async (req: Request, res: Response): Promise<void> => {
  const { projectId, userId } = req.params;
  const removerId = (req.user as any).userId;

  // Check if remover has permission to remove members
  const removerMembership = await prisma.projectMembership.findFirst({
    where: { 
      projectId: Number(projectId), 
      userId: removerId,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!removerMembership) {
    res.status(403).json({ message: 'You do not have permission to remove members' });
    return;
  }

  // Prevent removing the last owner
  const ownerCount = await prisma.projectMembership.count({
    where: { 
      projectId: Number(projectId), 
      role: 'OWNER' 
    }
  });

  if (ownerCount <= 1) {
    res.status(400).json({ message: 'Cannot remove the last project owner' });
    return;
  }

  // Remove member
  await prisma.projectMembership.delete({
    where: { 
      projectId_userId: { 
        projectId: Number(projectId), 
        userId: Number(userId) 
      }
    }
  });

  res.status(200).json({ message: 'Member removed successfully' });
};