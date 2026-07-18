import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardOverview from "./DashboardOverview";
import TaskManager from "./TaskManager";
import TaskCalendar from "./TaskCalendar";
import Profile from "./Profile";
import Settings from "./Settings";
import Teams from "./Teams"; 
import { X, Link as LinkIcon, ExternalLink, Save } from "lucide-react";

const Dashboard = () => {
  const { fetchWithAuth, logout, user } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState("dashboard"); 
  const [tasks, setTasks] = useState([]);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [darkMode, setDarkMode] = useState(false); 

  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State tạm thời để lưu trạng thái người dùng chọn trước khi ấn Lưu
  const [tempStatus, setTempStatus] = useState("");

  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "", priority: "MEDIUM", status: "TODO", attachmentUrl: "" });

  const getTasks = async () => {
    try {
      const res = await fetchWithAuth("/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { getTasks(); }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth("/tasks", { method: "POST", body: JSON.stringify(taskForm) });
      if (res.ok) { 
        setIsCreateOpen(false); 
        setTaskForm({ title: "", description: "", deadline: "", priority: "MEDIUM", status: "TODO", attachmentUrl: "" });
        getTasks(); 
      }
    } catch (err) { alert("Lỗi kết nối server!"); } finally { setLoading(false); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(`/tasks/${selectedTask._id}`, { method: "PUT", body: JSON.stringify(taskForm) });
      if (res.ok) { setIsEditOpen(false); setIsDetailOpen(false); getTasks(); }
    } catch (err) { alert("Lỗi!"); }
  };

  // 🛠️ HÀM LƯU TIẾN ĐỘ MỚI: Gửi trực tiếp lên API PUT tổng của công việc để tránh lỗi 404
  const handleSaveQuickStatus = async () => {
    setLoading(true);
    try {
      const updatedBody = {
        title: selectedTask.title,
        description: selectedTask.description,
        deadline: selectedTask.deadline,
        priority: selectedTask.priority,
        attachmentUrl: selectedTask.attachmentUrl,
        status: tempStatus // Lấy trạng thái mới từ nút vừa chọn
      };

      const res = await fetchWithAuth(`/tasks/${selectedTask._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedBody)
      });

      if (res.ok) {
        setIsDetailOpen(false);
        getTasks(); // Tải lại danh sách ra giao diện chính lập tức
      } else {
        alert("Không thể lưu trạng thái. Vui lòng kiểm tra lại dữ liệu.");
      }
    } catch (err) {
      alert("Lỗi kết nối mạng!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure delete this task?")) {
      const res = await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
      if (res.ok) { setIsDetailOpen(false); getTasks(); }
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setTempStatus(task.status); // Đặt trạng thái ban đầu khi mở modal
    setTaskForm({ title: task.title, description: task.description || "", deadline: task.deadline ? task.deadline.substring(0, 16) : "", priority: task.priority || "MEDIUM", status: task.status, attachmentUrl: task.attachmentUrl || "" });
    setIsDetailOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setTaskForm({ title: task.title, description: task.description || "", deadline: task.deadline ? task.deadline.substring(0, 16) : "", priority: task.priority || "MEDIUM", status: task.status, attachmentUrl: task.attachmentUrl || "" });
    setIsEditOpen(true);
  };

  const searchedTasks = tasks.filter(t => t.title.toLowerCase().includes(searchGlobal.toLowerCase()));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/50 text-slate-800"}`}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} handleLogout={logout} />
      
      {(currentTab === "dashboard" || currentTab === "calendar") && (
        <Header searchGlobal={searchGlobal} setSearchGlobal={setSearchGlobal} user={user} />
      )}
      
      <main className={`pl-64 p-6 min-h-screen ${(currentTab === "dashboard" || currentTab === "calendar") ? "pt-16" : "pt-6"}`}>
        {currentTab === "dashboard" && (
          <DashboardOverview tasks={searchedTasks} setCurrentTab={setCurrentTab} openTaskDetail={openTaskDetail} setOpenCreateModal={setIsCreateOpen} />
        )}
        {currentTab === "tasks" && (
          <TaskManager tasks={searchedTasks} openTaskDetail={openTaskDetail} openEditModal={openEditModal} handleDelete={handleDelete} setOpenCreateModal={setIsCreateOpen} />
        )}
        {currentTab === "calendar" && (
          <TaskCalendar tasks={searchedTasks} openTaskDetail={openTaskDetail} setTaskForm={setTaskForm} setOpenCreateModal={setIsCreateOpen} />
        )}
        {currentTab === "teams" && <Teams />}
        {currentTab === "profile" && <Profile user={user} />}
        {currentTab === "settings" && (
          <Settings user={user} fetchWithAuth={fetchWithAuth} logout={logout} darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </main>

      {/* POPUP TẠO TASK */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative border">
            <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={16}/></button>
            <h3 className="text-sm font-black text-slate-800 mb-4">+ Create Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Title *</label>
                <input type="text" required placeholder="Tên công việc..." className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Description</label>
                <textarea placeholder="Mô tả..." rows="2" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Deadline</label>
                  <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border rounded-xl bg-white outline-none" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Attachment URL</label>
                <input type="url" placeholder="https://..." className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.attachmentUrl} onChange={e => setTaskForm({...taskForm, attachmentUrl: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl">{loading ? "Processing..." : "Create Quick Task"}</button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP CHI TIẾT TASK DETAIL (ĐÃ THÊM NÚT LƯU TIẾN ĐỘ) */}
      {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border overflow-hidden flex flex-col md:flex-row max-h-[80vh]">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Task Detail</span>
                <button onClick={() => setIsDetailOpen(false)} className="text-slate-400"><X size={15}/></button>
              </div>
              <h3 className="text-base font-black text-slate-800 leading-snug">{selectedTask.title}</h3>
              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{selectedTask.description || "No description."}</div>

              {selectedTask.attachmentUrl && (
                <div className="p-2.5 border rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 truncate flex items-center gap-1"><LinkIcon size={12}/> Attachment Link</span>
                  <a href={selectedTask.attachmentUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px]"><ExternalLink size={11}/> View</a>
                </div>
              )}
            </div>

            {/* Khối quản lý trạng thái cập nhật nhanh */}
            <div className="w-full md:w-56 bg-slate-50 p-5 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide">Độ ưu tiên</span>
                  <span className="font-bold text-slate-700 block mt-0.5">{selectedTask.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide">Trạng thái hiện tại</span>
                  <span className="font-black text-indigo-600 block uppercase mt-0.5 text-xs">{selectedTask.status}</span>
                </div>
                
                {/* Chọn Tiến độ dạng click đổi state tạm thời */}
                <div className="space-y-1.5 pt-3 border-t">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide mb-1">Cập nhật tiến độ</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setTempStatus("TODO")} 
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border ${tempStatus === "TODO" ? "bg-slate-700 text-white border-slate-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                    >
                      {tempStatus === "TODO" ? "⬛ 0% (Chờ làm) ✓" : "⬜ 0% (Chờ làm)"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTempStatus("IN_PROGRESS")} 
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border ${tempStatus === "IN_PROGRESS" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                    >
                      {tempStatus === "IN_PROGRESS" ? "🟨 50% (Đang làm) ✓" : "🟨 50% (Đang làm)"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTempStatus("DONE")} 
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border ${tempStatus === "DONE" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                    >
                      {tempStatus === "DONE" ? "🟩 100% (Xong) ✓" : "🟩 100% (Hoàn thành)"}
                    </button>
                  </div>
                </div>

                {/* 🌟 NÚT LƯU TIẾN ĐỘ THỰC TẾ */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveQuickStatus}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-[11px] transition-all shadow-sm"
                >
                  <Save size={13}/> {loading ? "Đang lưu..." : "Lưu Trạng Thái"}
                </button>
              </div>
              
              <div className="flex gap-1.5 pt-3 border-t mt-3">
                <button onClick={() => { setIsDetailOpen(false); openEditModal(selectedTask); }} className="flex-1 bg-slate-200 text-slate-700 font-bold py-1.5 rounded-xl text-[11px] hover:bg-slate-300">Sửa</button>
                <button onClick={() => handleDelete(selectedTask._id)} className="bg-rose-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] hover:bg-rose-600">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CHỈNH SỬA TASK */}
      {isEditOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative border">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={16}/></button>
            <h3 className="text-sm font-black text-slate-800 mb-4">Edit Task</h3>
            <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
              <input type="text" required className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <textarea rows="2" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                <select className="w-full px-3 py-2 border rounded-xl bg-white outline-none" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option>
                </select>
              </div>
              <input type="url" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.attachmentUrl} onChange={e => setTaskForm({...taskForm, attachmentUrl: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;