const express = require("express");
const router = express.Router();

// Import các handler xử lý logic đăng ký, đăng nhập, hồ sơ và đổi mật khẩu
const { register, login, getProfile, changePassword } = require("../controllers/authController");

// Import middleware kiểm tra token để bảo vệ các route cần đăng nhập
const protect = require("../middleware/authMiddleware");

// Route đăng ký tài khoản mới
router.post("/register", register);

// Route đăng nhập và cấp token
router.post("/login", login);

// Route lấy thông tin cá nhân, cần token hợp lệ
router.get("/profile", protect, getProfile);

// Route đổi mật khẩu, cần token hợp lệ
router.post("/change-password", protect, changePassword);

module.exports = router;