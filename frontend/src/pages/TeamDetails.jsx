import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Plus, X, Users, Shield, CheckCircle, Clock, AlertCircle, Calendar, ArrowLeft } from "lucide-react";

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, user } = useContext(AuthContext);

  // Trạng thái lưu trữ dữ liệu từ Backend
  const [teamInfo, setTeamInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Trạng thái điều khiển Modal tạo công việc nhóm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assignee: "" // Lưu ID của thành viên được chỉ định
  });

  // Gọi API lấy thông tin chi tiết phòng làm việc
  const getRoomDetails = async () => {
    try {
      // 1. Lấy thông tin cơ bản của nhóm (để biết ai là Leader)
      const resTeam = await fetchWithAuth(`/team/my-teams`);
      let currentTeamMeta = null;
      if (resTeam.ok) {
        const dataMeta = await resTeam.json();
        const list = Array.isArray(dataMeta) ? dataMeta : dataMeta.teams || [];
        currentTeamMeta = list.find(t => t._id === teamId);
        setTeamInfo(currentTeamMeta);
      }

      // 2. Lấy danh sách thành viên và các task liên quan
      const resDetails = await fetchWithAuth(`/team/${teamId}/details`);
      if (resDetails.ok) {
        const dataDetails = await resDetails.json();
        setMembers(dataDetails.members || []);
        setTasks(dataDetails.tasks || []);
      } else {
        const errData = await resDetails.json();
        setErrorMsg(errData.message || "Không có quyền truy cập phòng này.");
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) getRoomDetails();
  }, [teamId]);

  // Hàm xử lý khi Trưởng nhóm gửi form tạo task và chỉ định thành viên
  const handleCreateTeamTask = async (e) => {
    e.preventDefault();
    if (!taskForm.assignee) {
      alert("Vui lòng chỉ định một thành viên thực hiện!");
      return;
    }

    try {
      const res = await fetchWithAuth(`/team/${teamId}/tasks`, {
        method: "POST",
        body: JSON.stringify(taskForm)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTaskForm({ title: "", description: "", deadline: "", assignee: "" });
        getRoomDetails(); // Tải lại danh sách task mới tinh vừa tạo
      } else {
        const err = await res.json();
        alert(err.message || "Không thể phân bổ công việc.");
      }
    } catch (err) {
      alert("Lỗi đường truyền mạng.");
    }
  };

  if (loading) return <div className="text-center text-sm font-bold text-slate-500 pt-12">🔄 Đang tải phòng làm việc nhóm...</div>;
  if (errorMsg) return <div className="text-center text-rose-500 font-bold pt-12">⚠️ {errorMsg}</div>;

  // Xác định quyền: User hiện tại có phải Leader của Team này dựa trên database không
  const isLeader = teamInfo?.isLeader || teamInfo?.leader === user?.id;

  // ==================== ĐOẠN SỬA LỖI TRƯỜNG LỌC HIỂN THỊ TASK THÀNH VIÊN ====================
  // Dự phòng trường hợp AuthContext trả về user.id hoặc user._id làm khóa chính đại diện
  const currentUserId = user?.id || user?._id;

  // PHÂN QUYỀN HIỂN THỊ TASK AN TOÀN TUYỆT ĐỐI: 
  // - Leader: Nhìn thấy toàn bộ task của cả nhóm
  // - Member: Chỉ nhìn thấy task do leader giao đúng với ID của chính mình
  const displayedTasks = isLeader 
    ? tasks 
    : tasks.filter(t => {
        if (!t.user) return false;

        // Trích xuất ID người thực hiện: bọc cả dạng Object (đã được populate) lẫn dạng String thô
        const assigneeId = typeof t.user === "object" 
          ? (t.user._id || t.user.id) 
          : t.user;

        // Ép sang định dạng String để tránh lệch kiểu dữ liệu khi so khớp
        return String(assigneeId) === String(currentUserId);
      });
  // =========================================================================================

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Thanh header điều hướng quay lại */}
      <button 
        onClick={() => navigate("/teams")}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại danh sách nhóm
      </button>

      {/* Thông tin Meta của Phòng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-800">{teamInfo?.name || "Phòng Làm Việc"}</h2>
            <span className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold ${
              isLeader ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
            }`}>
              <Shield size={10} /> {isLeader ? "QUYỀN: TRƯỞNG NHÓM" : "QUYỀN: THÀNH VIÊN"}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Mã số định danh nhóm: {teamInfo?.teamId}</p>
        </div>

        {/* Khối hiển thị số lượng và Trưởng nhóm công khai theo yêu cầu */}
        <div className="flex gap-4 items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
          <div className="text-center border-r pr-4 border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Thành viên</p>
            <p className="text-lg font-black text-indigo-600 flex items-center justify-center gap-1">
              <Users size={16} /> {members.length}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Trưởng nhóm (Leader)</p>
            <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
              {members.find(m => m.role === "leader")?.username || "Chưa xác định"}
            </p>
          </div>
        </div>
      </div>

      {/* Khu vực Task Workspace */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              {isLeader ? "📋 Toàn Bộ Task Của Đội Nhóm" : "🎯 Task Bạn Cần Thực Hiện"}
            </h3>
            <p className="text-xs text-slate-400">
              {isLeader ? "Theo dõi tiến độ và giao việc cho các thành viên." : "Các công việc do Trưởng nhóm phân công cụ thể cho bạn."}
            </p>
          </div>

          {/* CHỈ TRƯỞNG NHÓM MỚI ĐƯỢC PHÉP THẤY NÚT GIAO TASK */}
          {isLeader && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Giao Việc Cho Nhóm
            </button>
          )}
        </div>

        {/* Render danh sách công việc */}
        {displayedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed text-slate-400 text-sm">
            Hiện tại chưa có công việc nào được phân bổ tại đây.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedTasks.map(t => (
              <div key={t._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      t.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      t.status === 'in-progress' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{t.description || "Không có ghi chú mô tả."}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Hạn: {t.deadline ? new Date(t.deadline).toLocaleString("vi-VN") : "Chưa đặt"}</span>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Người làm</p>
                    <p className="font-bold text-indigo-600">
                      {typeof t.user === "object" ? t.user?.username : (members.find(m => m._id === t.user)?.username || "Không rõ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL GIAO TASK DÀNH RIÊNG CHO LEADER */}
      {isModalOpen && isLeader && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl border animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            
            <h3 className="text-lg font-black text-slate-800 mb-4">📢 Giao Việc Cho Thành Viên</h3>
            
            <form onSubmit={handleCreateTeamTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">TÊN CÔNG VIỆC</label>
                <input 
                  type="text" required placeholder="Nhập tiêu đề task..."
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">MÔ TẢ YÊU CẦU</label>
                <textarea 
                  placeholder="Ghi chú chi tiết công việc..." rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">CHỈ ĐỊNH THÀNH VIÊN THỰC HIỆN</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                  value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})}
                >
                  <option value="">-- Chọn một thành viên trong nhóm --</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.username} ({m.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">HẠN CHÓT</label>
                <input 
                  type="datetime-local" required
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-md">
                Phân Phối Task Đi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;