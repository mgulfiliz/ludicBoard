import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProjectRole } from '@prisma/client';

const prisma = new PrismaClient();

export const checkProjectAccess = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).userId;
    const projectId = Number(req.params.projectId || req.body.projectId);

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const membership = await prisma.projectMembership.findFirst({
      where: { 
        projectId, 
        userId,
        role: { in: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] } 
      }
    });

    if (!membership) {
      return res.status(403).json({ 
        message: 'You do not have access to this project' 
      });
    }

    // Attach user's project role to the request for further permission checks
    (req as any).userProjectRole = membership.role;
    next();
  } catch (error) {
    console.error('Project access check error:', error);
    res.status(500).json({ message: 'Internal server error during access check' });
  }
};

export const checkTaskPermission = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).userId;
    // Handle different route patterns for task ID
    const taskId = Number(
      req.params.taskId || 
      req.body.taskId || 
      (req.body.commentId ? 
        (await prisma.comment.findUnique({ 
          where: { id: Number(req.body.commentId) }, 
          select: { taskId: true } 
        }))?.taskId : 
        undefined
      )
    );

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: {
          include: {
            memberships: {
              where: { 
                userId,
                role: { in: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] }
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is project member or task creator/assignee
    const isProjectMember = task.project.memberships.length > 0;
    const isTaskCreator = task.authorUserId === userId;
    const isTaskAssignee = task.assignedUserId === userId;

    if (!isProjectMember && !isTaskCreator && !isTaskAssignee) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this task' 
      });
    }

    // Attach user's task permission to the request
    (req as any).userTaskPermission = 
      isTaskCreator ? 'FULL' : 
      isTaskAssignee ? 'PARTIAL' : 
      'VIEW';

    next();
  } catch (error) {
    console.error('Task permission check error:', error);
    res.status(500).json({ message: 'Internal server error during permission check' });
  }
};

export const requireProjectRole = (requiredRoles: ProjectRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userProjectRole = (req as any).userProjectRole;

    if (!userProjectRole || !requiredRoles.includes(userProjectRole)) {
      return res.status(403).json({ 
        message: 'Insufficient project role permissions' 
      });
    }

    next();
  };
};
