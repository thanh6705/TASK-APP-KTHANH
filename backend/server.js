const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// Import hàm kết nối MongoDB
const connectDB = require("./config/db");

// Import các nhóm route cho auth, task và team
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

// Middleware cho phép frontend gọi API từ domain khác
app.use(cors({
  origin: "*"
}));

// Cho phép server đọc dữ liệu JSON gửi từ client
app.use(express.json());

// Cho phép phục vụ file tĩnh của frontend từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Kết nối database khi server khởi động
connectDB();

// Gắn các route vào ứng dụng
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);

// Route kiểm tra nhanh server có đang hoạt động không
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Middleware xử lý lỗi chung cho toàn bộ ứng dụng
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

// Khởi động server trên cổng đã định
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});