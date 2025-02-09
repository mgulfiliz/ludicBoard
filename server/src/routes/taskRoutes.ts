import { Router, Request, Response } from "express";
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

const router = Router();

router.post(
  "/", 
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('projectId').isInt().withMessage('Project ID is required')
  ],
  validateRequest,
  authenticateToken,
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await createTask(req, res);
  })
);

router.get(
  "/", 
  authenticateToken,
  (req, res, next) => {
    // Temporarily move projectId from query to params for middleware
    (req.params as any).projectId = req.query.projectId;
    next();
  },
  checkProjectAccess,
  asyncHandler(async (req: Request, res: Response) => {
    await getTasks(req, res);
  })
);

router.patch(
  "/:taskId", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await updateTask(req, res);
  })
);

router.patch(
  "/:taskId/status", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await updateTaskStatus(req, res);
  })
);

router.get(
  "/user/:userId", 
  [
    param('userId').isInt().withMessage('User ID is required')
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    await getUserTasks(req, res);
  })
);

router.delete(
  "/:taskId", 
  [
    param('taskId').isInt().withMessage('Task ID is required')
  ],
  validateRequest,
  authenticateToken,
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    await deleteTask(req, res);
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
  checkTaskPermission,
  asyncHandler(async (req: Request, res: Response) => {
    console.log('Comment Creation Request:', {
      params: req.params,
      body: req.body,
      user: req.user
    });
    await createComment(req, res);
  })
);

router.delete(
  "/comments/:commentId", 
  [
    param('commentId').isInt().withMessage('Comment ID is required')
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    console.log('Delete Comment Request:', {
      params: req.params,
      user: req.user
    });
    await deleteComment(req, res);
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
  asyncHandler(async (req: Request, res: Response) => {
    console.log('Edit Comment Request:', {
      params: req.params,
      body: req.body,
      user: req.user
    });
    await editComment(req, res);
  })
);

export default router;