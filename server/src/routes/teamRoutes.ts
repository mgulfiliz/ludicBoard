import { Router, Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { getTeams } from "../controllers/teamController";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
  await getTeams(req, res);
}));

export default router;