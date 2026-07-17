import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Plus, X, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";

const TaskCalendar = () => {
  const { fetchWithAuth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [taskForm, setTaskForm] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    status: "todo", 
    fileData: "" 
  });

  const getTasks = async () => {
    const res = await fetchWithAuth("/tasks");
    if (res.ok) { 
      const data = await res.json(); 
      setTasks(data); 
    }
  };

  useEffect(() => { getTasks(); }, []);

  // Hàm chuyển đổi file thành Base64 lưu trực tiếp vào database
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTaskForm({ ...taskForm, fileData: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDayClick = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dateStr = String(day).padStart(2, '0');
    setTaskForm({ 
      title: "", 
      description: "", 
      deadline: `${year}-${month}-${dateStr}T09:00`, 
      status: "todo", 
      fileData: "" 
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth("/tasks", { 
      method: "POST", 
      body: JSON.stringify(taskForm) 
    });
    if (res.ok) { 
      setIsCreateModalOpen(false); 
      getTasks(); 
    } else {
      const err = await res.json();
      alert(err.message || "Lỗi khi tạo công việc");
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-28 border border-slate-100 bg-slate-50/40"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

    calendarCells.push(
      <div key={`day-${day}`} onClick={() => handleDayClick(day)} className="h-28 border border-slate-100 p-1.5 hover:bg-indigo-50/40 cursor-pointer flex flex-col justify-between group">
        <span className="text-xs font-bold text-slate-500">{day}</span>
        <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-none">
          {dayTasks.map(t => (
            <div key={t._id} className="text-[9px] px-1 py-0.5 rounded truncate font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{t.title}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Lịch Biểu Công Việc</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Tháng {month + 1} / {year}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-slate-200 rounded-lg"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-slate-200 rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center bg-slate-100/50 border-b text-xs font-bold text-slate-500 py-2">
          <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
        </div>
        <div className="grid grid-cols-7">{calendarCells}</div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button>
            <h3 className="text-lg font-black text-slate-800 mb-4">✍️ Lên Lịch Công Việc Nhanh</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" required placeholder="Tiêu đề..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <textarea placeholder="Mô tả..." rows="3" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" required className="w-full px-3 py-2 border rounded-lg text-sm outline-none" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Ô TẢI FILE ĐÃ ĐƯỢC THÊM HỢP LỆ VÀO ĐÂY */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">TỆP ĐÍNH KÈM (FILE LƯU THẬT VÀO DB)</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50 cursor-pointer relative hover:bg-slate-100 transition-all">
                  <Paperclip size={14} className="text-slate-500" />
                  <span className="text-xs text-slate-500 truncate">{taskForm.fileData ? "✓ Đã nạp file thành công" : "Chọn tệp từ thiết bị..."}</span>
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm shadow-md hover:bg-indigo-700 transition-colors">Tạo Công Việc</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;