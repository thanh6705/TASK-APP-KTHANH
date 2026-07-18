const Task = require("../models/Task");

// Lấy danh sách task cá nhân
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      $and: [
        { $or: [{ user: userId }, { createdBy: userId }] },
        { $or: [{ teamId: { $exists: false } }, { teamId: "" }, { teamId: null }] }
      ]
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo task cá nhân mới
exports.createTask = async (req, res) => {
  try {
    // 🌟 ĐÃ THÊM attachmentUrl ĐỂ ĐỒNG BỘ DỮ LIỆU TỪ FORM FRONTEND GỬI LÊN
    const { title, description, deadline, priority, attachmentUrl } = req.body;
    
    // Tạo bản ghi log đầu tiên
    const initialLog = {
      action: "Đã tạo công việc",
      performedBy: req.user.username || req.user.name || req.user.email || "User",
    };

    const task = await Task.create({
      title,
      description,
      deadline,
      priority: priority || "MEDIUM",
      status: "TODO",
      user: req.user.id,
      createdBy: req.user.id,
      attachmentUrl: attachmentUrl || "", // 🌟 LƯU ĐƯỜNG DẪN LINK VÀO DB
      activityLog: [initialLog]
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hàm đặc quyền: Chuyển đổi trạng thái theo quy trình (Workflow)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldStatus = task.status;
    task.status = status;

    // Ghi nhận log chuyển trạng thái công việc
    task.activityLog.push({
      action: `Chuyển trạng thái từ [${oldStatus}] sang [${status}]`,
      performedBy: req.user.username || req.user.name || req.user.email || "User"
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật toàn bộ nội dung task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Lưu vết sửa đổi thông tin
    req.body.activityLog = task.activityLog || [];
    req.body.activityLog.push({
      action: "Đã cập nhật thông tin chi tiết công việc",
      performedBy: req.user.username || req.user.name || req.user.email || "User"
    });

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa công việc
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};