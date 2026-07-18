import { CheckCircle2, PlayCircle, Clock, AlertCircle, Plus, Kanban, Calendar } from "lucide-react";

const DashboardOverview = ({ tasks, setCurrentTab, openTaskDetail, setOpenCreateModal }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "DONE").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter(t => t.status === "TODO").length;

  const upcomingTasks = tasks
    .filter(t => t.status !== "DONE" && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">🎯 Tổng Quan Dự Án</h2>
        <p className="text-xs text-slate-400 mt-0.5">Nắm bắt nhanh tiến độ và công việc khẩn cấp của bạn</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{total}</h3>
          </div>
          <AlertCircle className="text-indigo-500" size={28} />
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completed}</h3>
          </div>
          <CheckCircle2 className="text-emerald-500" size={28} />
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{inProgress}</h3>
          </div>
          <PlayCircle className="text-amber-500" size={28} />
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Todo</p>
            <h3 className="text-2xl font-black text-slate-600 mt-1">{todo}</h3>
          </div>
          <Clock className="text-slate-400" size={28} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm lg:col-span-2 space-y-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">⏰ Upcoming Deadline</h4>
          <div className="divide-y divide-slate-50">
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Không có công việc nào sắp đến hạn chót.</p>
            ) : (
              upcomingTasks.map(t => (
                <div key={t._id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="truncate max-w-[70%]">
                    <p onClick={() => openTaskDetail(t)} className="text-xs font-bold text-slate-700 hover:text-indigo-600 cursor-pointer truncate transition-colors">{t.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hạn chót: {new Date(t.deadline).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{t.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">⚡ Quick Action</h4>
          <div className="grid grid-cols-1 gap-2 flex-1 mt-2">
            {/* Nút bấm Tạo Task chính xác */}
            <button onClick={() => setOpenCreateModal(true)} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">Create Task</p>
                <p className="text-[10px] text-slate-400">Khởi tạo nhanh công việc mới</p>
              </div>
              <Plus size={16} className="text-slate-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => setCurrentTab("tasks")} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">View Tasks</p>
                <p className="text-[10px] text-slate-400">Xem bảng danh sách chi tiết</p>
              </div>
              <Kanban size={16} className="text-slate-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => setCurrentTab("calendar")} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">View Calendar</p>
                <p className="text-[10px] text-slate-400">Quản lý định hạn theo ô lịch</p>
              </div>
              <Calendar size={16} className="text-slate-400 group-hover:text-indigo-500" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm lg:col-span-3 space-y-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">🔄 Recently Updated</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center col-span-full">Chưa ghi nhận cập nhật nào.</p>
            ) : (
              recentTasks.map(t => (
                <div key={t._id} onClick={() => openTaskDetail(t)} className="p-3 border rounded-xl hover:border-indigo-200 cursor-pointer bg-slate-50/50 hover:bg-white transition-all space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 line-clamp-1">{t.title}</h5>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{new Date(t.updatedAt).toLocaleDateString("vi-VN")}</span>
                    <span className="font-bold text-indigo-500">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;