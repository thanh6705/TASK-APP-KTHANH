const mongoose = require("mongoose");

const teamSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Đội nhóm mới"
  },
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  creatorName: {
    type: String,
    default: "Người tạo"
  },
  creatorRole: {
    type: String,
    default: "Trưởng nhóm"
  }
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);
