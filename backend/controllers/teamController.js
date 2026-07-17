const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");
const UserTeam = require("../models/UserTeam"); // Import bảng liên kết Nhiều - Nhiều[cite: 2]

const normalizeTeamId = (input) => {
  if (!input) return "";
  const clean = input.toString().trim().toUpperCase();
  if (/^\d+$/.test(clean)) return `TEAM-${clean}`;
  if (/^TEAM-\d+$/.test(clean)) return clean;
  return clean;
};

module.exports.normalizeTeamId = normalizeTeamId;

const generateTeamId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TEAM-${random}`;
};

// Tạo Team và đồng bộ vào UserTeam[cite: 2]
exports.createTeam = async (req, res) => {
  try {
    const teamName = req.body.name ? req.body.name.toString().trim() : "";
    const creatorName = req.body.creatorName ? req.body.creatorName.toString().trim() : "Người tạo";
    const creatorRole = req.body.creatorRole ? req.body.creatorRole.toString().trim() : "Trưởng nhóm";

    if (!teamName) {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }

    const teamId = generateTeamId();
    const team = await Team.create({
      name: teamName,
      teamId,
      leader: req.user.id, // Sửa thành req.user.id để khớp chuẩn authMiddleware[cite: 2, 3]
      creatorName,
      creatorRole
    });

    // Cập nhật thông tin trưởng nhóm[cite: 2]
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (user) {
      user.teamId = teamId;
      user.role = "leader";
      await user.save();
    }

    // TẠO LIÊN KẾT TRONG BẢNG USERTEAM ĐỂ KHÔNG BỊ TRỐNG TRƠN KHI TẢI LẠI[cite: 2]
    await UserTeam.create({
      user: req.user.id, // Sửa thành req.user.id[cite: 2, 3]
      team: team._id,
      role: "leader"
    });

    res.json({ team, message: "Tạo team thành công" });
  } catch (error) {
    console.error("Lỗi tạo team:", error);
    res.status(500).json({ message: error.message });
  }
};

// Tham gia Team và đồng bộ vào UserTeam[cite: 2]
exports.joinTeam = async (req, res) => {
  try {
    const teamId = normalizeTeamId(req.body.teamId);
    const displayRole = (req.body.displayRole || "Thành viên").toString().trim();

    if (!teamId) {
      return res.status(400).json({ message: "Vui lòng nhập mã team task" });
    }

    const team = await Team.findOne({ teamId });

    if (!team) {
      return res.status(404).json({ message: "Mã team task không tồn tại hoặc team không tồn tại" });
    }

    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.teamId = team.teamId;
    user.role = "member";
    await user.save();

    // KIỂM TRA VÀ TẠO LIÊN KẾT TRONG BẢNG USERTEAM[cite: 2]
    const linkExists = await UserTeam.findOne({ user: user._id, team: team._id });
    if (!linkExists) {
      await UserTeam.create({
        user: user._id,
        team: team._id,
        role: "member"
      });
    }

    res.json({ team, message: "Tham gia team thành công", displayRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || !user.teamId) {
      return res.json({ team: null });
    }

    const team = await Team.findOne({ teamId: user.teamId }).populate("leader", "username email");
    const members = await User.find({ teamId: user.teamId }).select("_id username email role");

    res.json({ team, members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTeamTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || !user.teamId) {
      return res.status(400).json({ message: "You are not in a team" });
    }

    const { title, description, deadline, assignee } = req.body;
    const task = await Task.create({
      title,
      description,
      deadline,
      status: "todo",
      user: assignee || req.user.id, // Sửa thành req.user.id[cite: 2, 3]
      teamId: user.teamId,
      createdBy: req.user.id, // Sửa thành req.user.id[cite: 2, 3]
      submittedLink: ""
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || !user.teamId) {
      return res.json([]);
    }

    const query = user.role === "leader"
      ? { teamId: user.teamId }
      : { teamId: user.teamId, user: req.user.id }; // Sửa thành req.user.id[cite: 2, 3]

    const tasks = await Task.find(query).populate("user", "username email").populate("createdBy", "username");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeamTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || !user.teamId) return res.status(400).json({ message: "You are not in a team" });

    const isLeader = user.role === 'leader';
    const isAssignee = task.user.toString() === req.user.id.toString(); // Sửa thành req.user.id[cite: 2, 3]

    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!isLeader) {
      const allowedFields = ['status', 'submittedLink'];
      const updateData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }
      const updated = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return res.json(updated);
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sử dụng bảng UserTeam để render danh sách team không bao giờ bị mất dữ liệu[cite: 2]
exports.getMyTeams = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Lấy tất cả các team liên kết với user trong bảng UserTeam[cite: 2]
    const userTeamLinks = await UserTeam.find({ user: user._id }).populate("team");
    
    // Lọc bỏ phần tử null đề phòng data cũ lỗi[cite: 2]
    const teams = userTeamLinks.map(link => link.team).filter(team => team !== null);
    
    const teamsWithCount = await Promise.all(teams.map(async (team) => {
      const members = await User.find({ teamId: team.teamId });
      const isLeader = team.leader.toString() === req.user.id.toString(); // Sửa thành req.user.id[cite: 2, 3]
      return {
        ...team.toObject(),
        memberCount: members.length,
        isLeader: isLeader,
        creatorId: team.leader
      };
    }));
    
    res.json({ teams: teamsWithCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    
    const inTeam = await UserTeam.findOne({ user: user._id, team: team._id });
    if (!inTeam && user.teamId !== team.teamId) {
      return res.status(403).json({ message: "Not a member of this team" });
    }
    
    const members = await User.find({ teamId: team.teamId })
      .select('_id username email role')
      .lean();
    
    const tasks = await Task.find({ teamId: team.teamId })
      .populate('user', 'username email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      members: members,
      tasks: tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTeamTaskById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, deadline, assignee } = req.body;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || user.role !== 'leader') {
      return res.status(403).json({ message: "Only team leader can create tasks" });
    }
    
    if (assignee) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser || assigneeUser.teamId !== team.teamId) {
        return res.status(400).json({ message: "Assignee is not in this team" });
      }
    }
    
    const task = await Task.create({
      title,
      description,
      deadline,
      status: "todo",
      user: assignee || req.user.id, // Sửa thành req.user.id[cite: 2, 3]
      teamId: team.teamId,
      createdBy: req.user.id, // Sửa thành req.user.id[cite: 2, 3]
      submittedLink: ""
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTeamTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const team = await Team.findOne({ teamId: task.teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const user = await User.findById(req.user.id); // Sửa thành req.user.id[cite: 2, 3]
    if (!user || user.role !== 'leader') {
      return res.status(403).json({ message: "Only team leader can delete tasks" });
    }
    
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};