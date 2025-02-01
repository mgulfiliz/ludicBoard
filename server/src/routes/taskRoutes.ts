import express from "express";
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

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);
router.delete("/:taskId", deleteTask);

// Comment routes
router.post("/:taskId/comments", createComment);
router.delete("/comments/:commentId", deleteComment);
router.patch("/comments/:commentId", editComment);

export default router;