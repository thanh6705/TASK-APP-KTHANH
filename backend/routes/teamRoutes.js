const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createTeam,
  joinTeam,
  getMyTeam,
  createTeamTask,
  getTeamTasks,
  updateTeamTask,
  getMyTeams,
  getTeamDetails,
  createTeamTaskById,
  deleteTeamTask
} = require("../controllers/teamController");

router.post("/create", protect, createTeam);
router.post("/join", protect, joinTeam);
router.get("/me", protect, getMyTeam);
router.post("/tasks", protect, createTeamTask);
router.get("/tasks", protect, getTeamTasks);
router.put("/tasks/:id", protect, updateTeamTask);

// === THÊM MỚI ===
router.get("/my-teams", protect, getMyTeams);
router.get("/:teamId/details", protect, getTeamDetails);
router.post("/:teamId/tasks", protect, createTeamTaskById);
router.delete("/tasks/:id", protect, deleteTeamTask);

module.exports = router;