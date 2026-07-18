import { useState } from "react";
import { Calendar as CalendarIcon, Eye, Edit, Trash2, Search } from "lucide-react";

const TaskManager = ({ tasks, openTaskDetail, openEditModal, handleDelete, setOpenCreateModal }) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDeadline, setFilterDeadline] = useState("ALL");
  const [localSearch, setLocalSearch] = useState(""); // State quản lý ô tìm kiếm bằng chữ

  const checkDeadlineFilter = (deadlineStr, filterValue) => {
    if (filterValue === "ALL") return true;
    if (!deadlineStr) return false;

    const taskDate = new Date(deadlineStr);
    const today = new Date(2026, 6, 18); 
    
    const taskNum = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();
    const todayNum = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    if (filterValue === "TODAY") return taskNum === todayNum;
    if (filterValue === "WEEK") {
      const oneWeekLater = todayNum + 7 * 24 * 60 * 60 * 1000;
      return taskNum >= todayNum && taskNum <= oneWeekLater;
    }
    return true;
  };

  const filteredTasks = tasks.filter((task) => {
    // 1. Lọc theo chữ (Tìm kiếm theo Tên công việc)
    const matchesSearch = task.title.toLowerCase().includes(localSearch.toLowerCase());
    
    // 2. Lọc theo Tiến độ
    const matchesStatus = filterStatus === "ALL" || task.status === filterStatus;
    
    // 3. Lọc theo Hạn chót
    const matchesDeadline = checkDeadlineFilter(task.deadline, filterDeadline);
    
    return matchesSearch && matchesStatus && matchesDeadline;
  });

  const renderStatusProgress = (status) => {
    switch (status) {
      case "DONE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">● 100% (Đã xong)</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200">● 50% (Đang làm)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-200">● 0% (Chờ làm)</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Khối tiêu đề chính */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight">📋 Task Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Tìm kiếm và lọc nâng cao các đầu việc của bạn</p>
        </div>
        <button onClick={() => setOpenCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all">+ Create Task</button>
      </div>

      {/* THANH BỘ LỌC TÍCH HỢP Ô TÌM KIẾM BẰNG CHỮ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
        
        {/* 🔍 Ô Tìm kiếm bằng chữ mới */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Nhập tên công việc cần tìm..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50/50 transition-colors"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Các bộ lọc select đi kèm bên dưới */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status (Tất cả tiến độ)</option>
              <option value="TODO">0% (Todo)</option>
              <option value="IN_PROGRESS">50% (In Progress)</option>
              <option value="DONE">100% (Completed)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deadline</label>
            <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-500" value={filterDeadline} onChange={(e) => setFilterDeadline(e.target.value)}>
              <option value="ALL">All Time (Mọi thời gian)</option>
              <option value="TODAY">Today (Hôm nay)</option>
              <option value="WEEK">This Week (Trong tuần này)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DANH SÁCH TASK SAU KHI LỌC */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-14 text-xs text-slate-400 italic m-4">
            Không tìm thấy công việc nào khớp với từ khóa hoặc bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div key={task._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-slate-700">{task.title}</h4>
                    {renderStatusProgress(task.status)}
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{task.priority}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{task.description || "Chưa có mô tả."}</p>
                  {task.deadline && <p className="text-[10px] text-slate-400 font-medium">⏰ Hạn chót: {new Date(task.deadline).toLocaleString("vi-VN")}</p>}
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <button onClick={() => openTaskDetail(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><Eye size={15} /></button>
                  <button onClick={() => openEditModal(task)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"><Edit size={15} /></button>
                  <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;