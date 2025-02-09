import { Router, Request, Response } from "express";
import { body, param } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { 
  createProject, 
  getProjects, 
  deleteProject,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember
} from "../controllers/projectController";
import { validateRequest } from "../middleware/errorHandler";
import { checkProjectAccess } from '../middleware/permissionMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get("/", authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  await getProjects(req, res);
}));

router.post(
  "/", 
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Project name must be between 3 and 50 characters')
      .escape(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('teamId')
      .optional()
      .isInt({ min: 1 }).withMessage('Team ID must be a positive integer')
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    await createProject(req, res);
  })
);

router.delete(
  "/:projectId", 
  [
    param('projectId')
      .isInt({ min: 1 }).withMessage('Project ID must be a positive integer')
  ],
  validateRequest,
  authenticateToken,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await deleteProject(req, res);
  })
);

// Project Membership Routes
router.post(
  "/:projectId/members", 
  [
    param('projectId')
      .isInt({ min: 1 }).withMessage('Project ID must be a positive integer')
  ],
  validateRequest,
  authenticateToken,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await addProjectMember(req, res);
  })
);

router.patch(
  "/:projectId/members/:userId/role", 
  [
    param('projectId')
      .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
    param('userId')
      .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
  ],
  validateRequest,
  authenticateToken,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await updateProjectMemberRole(req, res);
  })
);

router.delete(
  "/:projectId/members/:userId", 
  [
    param('projectId')
      .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
    param('userId')
      .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
  ],
  validateRequest,
  authenticateToken,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await removeProjectMember(req, res);
  })
);

export default router;