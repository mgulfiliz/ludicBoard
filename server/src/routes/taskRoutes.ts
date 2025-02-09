import { Router, Request, Response, NextFunction } from "express";
import { body, param } from 'express-validator';
import asyncHandler from 'express-async-handler';
import {
  createTask,
  getTasks,
  getUserTasks,
  updateTask,
  deleteTask,
  createComment,
  deleteComment,
  editComment,
  updateTaskStatus,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
import { checkProjectAccess, checkTaskPermission } from "../middleware/permissionMiddleware";
import { validateRequest } from "../middleware/errorHandler";

// Define an interface for the authenticated user in the request
interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: number;
}

// Type guard to check if a request is authenticated
function isAuthenticatedRequest(req: Request): req is Request & { user: User } {
  return req.user !== undefined && 
         typeof req.user === 'object' && 
         'userId' in req.user &&
         'username' in req.user &&
         'email' in req.user;
}

// Middleware to ensure type safety
const ensureAuthenticatedRequest = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!isAuthenticatedRequest(req)) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const router = Router();

router.post(
  "/", 
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('projectId').isInt().withMessage('Project ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    // Type assertion to help TypeScript understand the request is authenticated
    await createTask(req as Request & { user: User }, res);
  })
);

router.get(
  "/", 
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    // Temporarily move projectId from query to params for middleware
    (req.params as any).projectId = req.query.projectId;
    next();
  },
  ensureAuthenticatedRequest,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await getTasks(req as Request & { user: User }, res);
  })
);

router.patch(
  "/:taskId", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await updateTask(req as Request & { user: User }, res);
  })
);

router.patch(
  "/:taskId/status", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await updateTaskStatus(req as Request & { user: User }, res);
  })
);

router.get(
  "/user/:userId", 
  [
    param('userId').isInt().withMessage('User ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  asyncHandler(async (req: Request, res: Response) => {
    await getUserTasks(req as Request & { user: User }, res);
  })
);

router.delete(
  "/:taskId", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await deleteTask(req as Request & { user: User }, res);
  })
);

// Comment routes
router.post(
  "/:taskId/comments", 
  [
    param('taskId').isInt().withMessage('Task ID must be an integer'),
    body('text')
      .notEmpty().withMessage('Comment text is required')
      .isString().withMessage('Comment text must be a string')
      .trim()
      .escape(),
    body('userId')
      .optional()
      .isInt().withMessage('User ID must be an integer if provided')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await createComment(req as Request & { user: User }, res);
  })
);

router.delete(
  "/comments/:commentId", 
  [
    param('commentId').isInt().withMessage('Comment ID is required')
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  asyncHandler(async (req: Request, res: Response) => {
    await deleteComment(req as Request & { user: User }, res);
  })
);

router.patch(
  "/comments/:commentId", 
  [
    param('commentId').isInt().withMessage('Comment ID is required'),
    body('text')
      .notEmpty().withMessage('Comment text is required')
      .isString().withMessage('Comment text must be a string')
      .trim()
      .escape()
  ],
  validateRequest,
  authenticateToken,
  ensureAuthenticatedRequest,
  asyncHandler(async (req: Request, res: Response) => {
    await editComment(req as Request & { user: User }, res);
  })
);

export default router;