const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require("../controllers/taskController");

router.route("/")
  .get(protect, getTasks)
  .post(protect, createTask);

router.route("/:id")
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Cập nhật nhanh vòng đời trạng thái của Task
router.route("/:id/status")
  .put(protect, updateTaskStatus);

module.exports = router;