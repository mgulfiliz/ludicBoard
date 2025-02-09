import { Router, Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { getTeams } from "../controllers/teamController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/", 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    await getTeams(req, res);
  })
);

export default router;