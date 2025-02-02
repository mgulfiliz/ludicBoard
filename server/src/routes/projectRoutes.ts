import { Router, Request, Response } from "express";
import { body, param } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { createProject, getProjects, deleteProject } from "../controllers/projectController";
import { validateRequest } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
    await deleteProject(req, res);
  })
);

export default router;