import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import { search } from "../controllers/searchController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/", 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await search(req, res, next);
  })
);

export default router;