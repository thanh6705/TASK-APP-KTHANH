const mongoose = require("mongoose");

const userTeamSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  role: {
    type: String,
    enum: ["leader", "member"],
    default: "member"
  }
}, { timestamps: true });

module.exports = mongoose.model("UserTeam", userTeamSchema);
