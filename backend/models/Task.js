const mongoose = require("mongoose");

// Schema lưu công việc của người dùng, bao gồm tiêu đề, mô tả, hạn chót và trạng thái
const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  teamId: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  submittedLink: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);