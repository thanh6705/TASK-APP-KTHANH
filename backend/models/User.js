const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Sử dụng thư viện bcryptjs để mã hóa mật khẩu

// Schema lưu thông tin người dùng: tên, email, mật khẩu
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  teamId: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["leader", "member"],
    default: "member"
  }
}, { timestamps: true });

// ==================== CODE SỬA LỖI KHÔNG DÙNG CALLBACK NEXT ====================

// Tự động mã hóa (hash) mật khẩu trước khi lưu vào Database
userSchema.pre("save", async function () {
  // KHÔNG truyền 'next' vào tham số hàm async nữa!
  
  // Nếu mật khẩu không bị thay đổi (ví dụ: chỉ cập nhật teamId khi tạo nhóm), thoát hàm luôn
  if (!this.isModified("password")) {
    return;
  }
  
  // Tiến hành hash mật khẩu an toàn
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // KHÔNG gọi next() ở đây, hàm async kết thúc Mongoose sẽ tự hiểu để save tiếp!
});

// Định nghĩa hàm matchPassword để so khớp mật khẩu lúc Đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==============================================================================

module.exports = mongoose.model("User", userSchema);