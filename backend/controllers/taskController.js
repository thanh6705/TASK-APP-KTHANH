const Task = require("../models/Task");

// Lấy danh sách task cá nhân (Chỉ lấy các task KHÔNG có teamId)
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id; // Sử dụng req.user.id thống nhất từ middleware
    
    const tasks = await Task.find({
      $and: [
        // Điều kiện 1: Phải là task của riêng user này tạo hoặc được giao
        {
          $or: [
            { user: userId },
            { createdBy: userId }
          ]
        },
        // Điều kiện 2: Tuyệt đối KHÔNG chứa trường teamId (để loại bỏ task nhóm)
        {
          $or: [
            { teamId: { $exists: false } },
            { teamId: "" },
            { teamId: null }
          ]
        }
      ]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo task cá nhân
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const task = await Task.create({
      title,
      description,
      deadline,
      status: "todo",
      user: req.user.id,
      createdBy: req.user.id
      // Không truyền teamId -> mặc định là Task Cá Nhân độc lập
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái hoặc nội dung task cá nhân
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = task.user.toString() === req.user.id.toString();
    const isCreator = task.createdBy && task.createdBy.toString() === req.user.id.toString();

    if (!isOwner && !isCreator) {
      return res.status(401).json({ message: "Not authorized to update this task" });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa task cá nhân
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = task.user.toString() === req.user.id.toString();
    const isCreator = task.createdBy && task.createdBy.toString() === req.user.id.toString();

    if (!isOwner && !isCreator) {
      return res.status(401).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};