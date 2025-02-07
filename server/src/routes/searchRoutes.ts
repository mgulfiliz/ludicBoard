import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import { search } from "../controllers/searchController";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await search(req, res, next);
}));

export default router;