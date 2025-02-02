import { Router, Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { search } from "../controllers/searchController";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
  await search(req, res);
}));

export default router;