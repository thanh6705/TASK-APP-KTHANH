import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TaskCalendar = ({ tasks, openTaskDetail, setTaskForm, setOpenCreateModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 18));
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 6, 18));

  const getTasksForDay = (day) => {
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleDayClick = (day) => {
    setSelectedDayTasks(getTasksForDay(day));
    setSelectedDateStr(`${day}/${month + 1}`);
  };

  const handleQuickCreate = (day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    // Gán sẵn hạn chót tương ứng ngày được click
    setTaskForm({ title: "", description: "", deadline: `${year}-${formattedMonth}-${formattedDay}T12:00`, priority: "MEDIUM", status: "TODO", attachmentUrl: "" });
    setOpenCreateModal(true); // 🌟 KÍCH HOẠT MỞ MODAL LÊN FILE CHA
  };

  const cells = [];
  for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
    cells.push(<div key={`empty-${i}`} className="h-20 bg-slate-50/50 border border-slate-100"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDay(day);
    cells.push(
      <div key={`day-${day}`} onClick={() => handleDayClick(day)} className="h-20 border border-slate-100 p-1 bg-white hover:bg-slate-50 cursor-pointer flex flex-col justify-between group">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">{day}</span>
          {/* Nút click mở nhanh Modal */}
          <button onClick={(e) => { e.stopPropagation(); handleQuickCreate(day); }} className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold hover:scale-125 transition-all px-1">+</button>
        </div>
        <div className="overflow-hidden space-y-0.5 max-h-[45px]">
          {dayTasks.slice(0, 2).map(t => (
            <div key={t._id} className="text-[9px] bg-indigo-50 text-indigo-700 rounded px-1 truncate font-medium">{t.title}</div>
          ))}
          {dayTasks.length > 2 && <div className="text-[8px] text-slate-400 pl-1">+{dayTasks.length - 2} task</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{monthNames[month]} {year}</h3>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg"><ChevronLeft size={14}/></button>
            <button onClick={handleToday} className="text-[10px] font-black px-2 py-0.5 hover:bg-white rounded-lg">Today</button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 pb-1">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        <div className="grid grid-cols-7 border-t border-l rounded-xl overflow-hidden">{cells}</div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-fit space-y-3">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Tasks on {selectedDateStr || "__/__"}</h4>
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {!selectedDateStr ? (
            <p className="text-xs text-slate-400 italic text-center py-4">Click một ngày trên lịch để xem.</p>
          ) : selectedDayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">Trống.</p>
          ) : (
            selectedDayTasks.map(t => (
              <div key={t._id} onClick={() => openTaskDetail(t)} className="p-2.5 border rounded-xl bg-slate-50 text-xs font-bold text-slate-700 hover:bg-indigo-50/50 cursor-pointer transition-all truncate">{t.title}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;