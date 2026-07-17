const express = require("express");
const router = express.Router();

// Middleware bảo vệ các route task, bắt buộc phải có token hợp lệ
const protect = require("../middleware/authMiddleware");

// Import các handler tương ứng với CRUD task
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// Route /api/tasks
// GET: lấy danh sách task của người dùng đang đăng nhập
// POST: tạo task mới cho người dùng hiện tại
router.route("/")
  .get(protect, getTasks)
  .post(protect, createTask);

// Route /api/tasks/:id
// PUT: cập nhật task theo id
// DELETE: xóa task theo id
router.route("/:id")
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;