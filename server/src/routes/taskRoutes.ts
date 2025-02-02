import { Router, Request, Response } from "express";
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

const router = Router();

router.post("/", asyncHandler(async (req: Request, res: Response) => {
  await createTask(req, res);
}));

router.get("/", asyncHandler(async (req: Request, res: Response) => {
  await getTasks(req, res);
}));

router.patch("/:taskId", asyncHandler(async (req: Request, res: Response) => {
  await updateTask(req, res);
}));

router.patch("/:taskId/status", asyncHandler(async (req: Request, res: Response) => {
  await updateTaskStatus(req, res);
}));

router.get("/user/:userId", asyncHandler(async (req: Request, res: Response) => {
  await getUserTasks(req, res);
}));

router.delete("/:taskId", asyncHandler(async (req: Request, res: Response) => {
  await deleteTask(req, res);
}));

// Comment routes
router.post("/:taskId/comments", asyncHandler(async (req: Request, res: Response) => {
  await createComment(req, res);
}));

router.delete("/comments/:commentId", asyncHandler(async (req: Request, res: Response) => {
  await deleteComment(req, res);
}));

router.patch("/comments/:commentId", asyncHandler(async (req: Request, res: Response) => {
  await editComment(req, res);
}));

export default router;