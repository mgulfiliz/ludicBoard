import { Router, Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { getUsers } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/", 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    await getUsers(req, res);
  })
);

export default router;