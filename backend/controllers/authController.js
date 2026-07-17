const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Khi User.create được gọi, middleware pre("save") trong model User sẽ tự động hash mật khẩu
    const user = await User.create({
      username,
      email,
      password,
      role: "member", // Mặc định ban đầu là member
      teamId: ""      // Chưa thuộc nhóm nào
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập tài khoản
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Gọi hàm matchPassword đã được định nghĩa trong User.js
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin cá nhân của người dùng đang đăng nhập
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Đảm bảo trả đầy đủ thông tin để Frontend quản lý trạng thái chính xác
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,     
      teamId: user.teamId  
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ĐỔI MẬT KHẨU (Đã sửa lỗi bất đồng bộ tên biến với Frontend)
exports.changePassword = async (req, res) => {
  try {
    // Frontend gửi lên 'old_password' và 'new_password'
    const { old_password, new_password } = req.body; 
    const currentPassword = old_password || req.body.currentPassword;
    const newPassword = new_password || req.body.newPassword;

    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác" });
    }

    // Gán mật khẩu mới (Mongoose tự động hash nhờ pre-save)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};