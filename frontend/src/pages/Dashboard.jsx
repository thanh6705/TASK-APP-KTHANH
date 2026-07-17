import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Search, Filter, Trash, Eye, Edit2, X, Paperclip, Plus } from "lucide-react";

const Dashboard = () => {
  const { fetchWithAuth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "", status: "todo", fileData: "" });

  const getTasks = async () => {
    const res = await fetchWithAuth("/tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  useEffect(() => { getTasks(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTaskForm({ ...taskForm, fileData: reader.result });
    reader.readAsDataURL(file);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth("/tasks", { method: "POST", body: JSON.stringify(taskForm) });
    if (res.ok) { setIsCreateModalOpen(false); getTasks(); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth(`/tasks/${selectedTask._id}`, { method: "PUT", body: JSON.stringify(taskForm) });
    if (res.ok) { setIsModalOpen(false); getTasks(); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Xóa công việc này?")) {
      const res = await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
      if (res.ok) { setIsModalOpen(false); getTasks(); }
    }
  };

  const openDetail = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      deadline: task.deadline ? task.deadline.substring(0, 16) : "",
      status: task.status,
      fileData: task.fileData || ""
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Lọc và tìm kiếm
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-850">Bảng Công Việc Cá Nhân</h2>
        <button 
          onClick={() => { setTaskForm({ title: "", description: "", deadline: "", status: "todo", fileData: "" }); setIsCreateModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shadow-md"
        >
          <Plus size={16} /> Thêm Mới
        </button>
      </div>

      {/* Thanh Tìm Kiếm và Lọc */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Tìm kiếm tên công việc hoặc nội dung..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={16} />
          <select
            className="border px-3 py-2 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-indigo-500"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="todo">Cần Làm (Todo)</option>
            <option value="in-progress">Đang Làm</option>
            <option value="done">Hoàn Thành</option>
          </select>
        </div>
      </div>

      {/* Danh Sách Thẻ Task */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed text-slate-400">Không tìm thấy công việc tương ứng.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredTasks.map(t => (
            <div 
              key={t._id} onClick={() => openDetail(t)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-800 line-clamp-1">{t.title}</h4>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    t.status === 'done' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    t.status === 'in-progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.description || "Không có mô tả chi tiết."}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                <span>⏰ Hạn: {t.deadline ? new Date(t.deadline).toLocaleString("vi-VN") : "Không giới hạn"}</span>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openDetail(t); }} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Eye size={13} /></button>
                  <button onClick={(e) => handleDelete(t._id, e)} className="p-1 hover:bg-rose-50 rounded text-rose-500"><Trash size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO TASK */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button>
            <h3 className="text-lg font-black text-slate-800 mb-4">✍️ Thêm Công Việc</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" required placeholder="Tiêu đề..." className="w-full px-3 py-2 border rounded-lg text-sm" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <textarea placeholder="Mô tả..." rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" required className="w-full px-3 py-2 border rounded-lg text-sm" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                </select>
              </div>
              <div className="relative border rounded-lg px-3 py-1.5 bg-slate-50 text-xs text-slate-500">
                <Paperclip size={14} className="inline mr-1" /> {taskForm.fileData ? "Đã chọn file" : "Chọn file đính kèm..."}
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm shadow-md">Tạo Mới</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT / SỬA */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button>
            
            <div className="flex justify-end gap-2 mb-3">
              <button onClick={() => setIsEditMode(!isEditMode)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={14} /></button>
              <button onClick={(e) => handleDelete(selectedTask._id, e)} className="p-1 hover:bg-rose-50 rounded text-rose-500"><Trash size={14} /></button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              {isEditMode ? (
                <>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                  <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="datetime-local" required className="w-full px-3 py-2 border rounded-lg text-sm" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                    <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                      <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm">Cập Nhật</button>
                </>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-800">{selectedTask.title}</h3>
                  <p className="text-sm text-slate-500 whitespace-pre-wrap">{selectedTask.description || "Không có mô tả chi tiết."}</p>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-500 border">
                    <p>🗓️ <b>Hạn chót:</b> {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString("vi-VN") : "Không"}</p>
                    <p>📌 <b>Trạng thái:</b> <span className="font-bold text-indigo-600 uppercase">{selectedTask.status}</span></p>
                  </div>
                  {selectedTask.fileData && (
                    <div className="pt-2">
                      {selectedTask.fileData.startsWith("data:image/") ? (
                        <img src={selectedTask.fileData} className="max-h-40 rounded-lg object-contain border mx-auto" alt="dinh kem" />
                      ) : (
                        <a href={selectedTask.fileData} download className="text-xs text-indigo-600 font-bold underline">📎 Tải file đính kèm</a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;