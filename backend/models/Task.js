const mongoose = require("mongoose");

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
  // Quy trình vòng đời chuẩn hóa chữ hoa giống Jira
  status: {
    type: String,
    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
    default: "TODO"
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Assignee (Người nhận task)
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Creator (Người tạo task)
  },
  teamId: {
    type: String,
    default: ""
  },
  
  // 🌟 THÊM TRƯỜNG NÀY ĐỂ LƯU TEXT LINK TIẾT KIỆM DUNG LƯỢNG MONGODB ATLAS
  attachmentUrl: {
    type: String,
    default: ""
  },

  // Lưu trữ file đính kèm khoa học hơn
  attachments: [{
    fileName: { type: String },
    fileData: { type: String }, // Base64
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Điểm cốt lõi: Ghi nhận lịch sử thao tác của con người
  activityLog: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true }, // Tên hoặc email người thực hiện
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);