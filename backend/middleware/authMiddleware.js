const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware kiểm tra token JWT trước khi cho phép truy cập các route cần đăng nhập
const protect = async (req, res, next) => {
  let token;

  // Token được gửi ở header Authorization theo dạng Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Xác thực token bằng secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng trong database từ id được giải mã, bỏ trường password
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  return res.status(401).json({ message: "No token" });
};

module.exports = protect;