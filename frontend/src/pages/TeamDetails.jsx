import { useState, useEffect } from "react";
import { ArrowLeft, Users, Plus, CheckCircle2, Link as LinkIcon, ExternalLink, Send, X } from "lucide-react";

const TeamDetails = ({ selectedTeam, user, fetchWithAuth, onBack }) => {
  const [members, setMembers] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form tạo task: BE nhận single field `assignee` chứ không phải mảng assignedTo
  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "", assignee: "" });
  const [submissionUrls, setSubmissionUrls] = useState({}); 

  const getTeamData = async () => {
    try {
      // Khớp đúng endpoint BE: /api/team/:teamId/details
      const res = await fetchWithAuth(`/team/${selectedTeam._id}/details`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setTeamTasks(data.tasks || []);
      }
    } catch (err) { 
      console.error("Lỗi tải chi tiết nhóm:", err); 
    }
  };

  useEffect(() => { 
    if (selectedTeam?._id) getTeamData(); 
  }, [selectedTeam]);

  // Kiểm tra quyền Trưởng nhóm dựa trên trường dữ liệu từ component cha hoặc từ mảng dữ liệu
  const isLeader = selectedTeam?.isLeader || selectedTeam?.leader === user?._id;

  const handleCreateTeamTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Khớp đúng endpoint BE: POST /api/team/:teamId/tasks
      const res = await fetchWithAuth(`/team/${selectedTeam._id}/tasks`, {
        method: "POST",
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        setIsCreateTaskOpen(false);
        setTaskForm({ title: "", description: "", deadline: "", assignee: "" });
        getTeamData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Lỗi giao task!");
      }
    } catch (err) { 
      alert("Lỗi hệ thống!"); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUrl = async (taskId) => {
    const url = submissionUrls[taskId];
    if (!url) return alert("Vui lòng nhập link trước khi nộp!");
    try {
      // Khớp đúng endpoint cập nhật task của BE: PUT /api/team/tasks/:id
      const res = await fetchWithAuth(`/team/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ submittedLink: url, status: "done" })
      });
      if (res.ok) {
        alert("Nộp sản phẩm thành công!");
        getTeamData();
      } else {
        alert("Không thể nộp link.");
      }
    } catch (err) { 
      alert("Lỗi kết nối server!"); 
    }
  };

  return (
    <div className="space-y-6">
      {/* Thanh header điều hướng */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">Phòng Làm Việc: {selectedTeam?.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Mã ID nhóm: <span className="font-bold text-indigo-600">{selectedTeam?.teamId}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DANH SÁCH CÔNG VIỆC NHÓM */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Danh sách việc được giao</h3>
            {isLeader && (
              <button onClick={() => setIsCreateTaskOpen(true)} className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Plus size={12}/> Giao việc mới
              </button>
            )}
          </div>

          <div className="space-y-3">
            {teamTasks.length === 0 ? (
              <div className="bg-white text-center py-12 text-xs text-slate-400 border rounded-2xl border-dashed">Chưa có công việc nào trong nhóm này.</div>
            ) : (
              teamTasks.map((task) => {
                // Kiểm tra xem user hiện tại có phải người nhận task không
                const isMyTask = task.user?._id === user?._id;
                return (
                  <div key={task._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-700">{task.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.description || "Không có mô tả."}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">{task.status}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 bg-slate-50/80 p-2 rounded-xl flex justify-between items-center">
                      <span>👤 Người nhận: <span className="font-bold text-slate-700">{task.user?.username || "Chưa chỉ định"}</span></span>
                      {task.deadline && <span>⏰ Hạn: {new Date(task.deadline).toLocaleDateString("vi-VN")}</span>}
                    </div>

                    <div className="pt-2 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div>
                        {task.submittedLink ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 size={12}/> Đã nộp sản phẩm: 
                            <a href={task.submittedLink} target="_blank" rel="noreferrer" className="underline text-indigo-600 flex items-center gap-0.5 font-medium ml-1"><ExternalLink size={10}/>Xem link</a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">⏳ Chưa nộp báo cáo kết quả.</span>
                        )}
                      </div>

                      {/* Hiển thị ô nộp cho đúng thành viên được giao việc và chưa có link */}
                      {!task.submittedLink && isMyTask && (
                        <div className="flex gap-1 w-full sm:w-auto">
                          <input 
                            type="url" 
                            placeholder="Dán link (Drive, GitHub...)" 
                            className="px-2.5 py-1 text-[11px] border rounded-xl outline-none w-full sm:w-48 bg-slate-50"
                            value={submissionUrls[task._id] || ""}
                            onChange={e => setSubmissionUrls({ ...submissionUrls, [task._id]: e.target.value })}
                          />
                          <button onClick={() => handleSubmitUrl(task._id)} className="bg-emerald-600 text-white p-1.5 rounded-xl"><Send size={12}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* THÀNH VIÊN ĐỘI NHÓM */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-fit space-y-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Users size={14}/> Thành Viên Nhóm ({members.length})</h3>
          <div className="divide-y text-xs">
            {members.map((m) => (
              <div key={m._id} className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-700">{m.username}</span>
                  {m._id === selectedTeam?.leader && <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1 rounded">Leader</span>}
                </div>
                <span className="text-[10px] text-slate-400">{m.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPUP MODAL GIAO TASK NHÓM */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border relative">
            <button onClick={() => setIsCreateTaskOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={16}/></button>
            <h3 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">🎯 Giao Việc Cho Thành Viên</h3>
            <form onSubmit={handleCreateTeamTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Tiêu đề công việc *</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Mô tả chi tiết</label>
                <textarea rows="2" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Hạn chót</label>
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl outline-none" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Chỉ định người thực hiện *</label>
                <select required className="w-full px-3 py-2 border rounded-xl bg-white outline-none" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                  <option value="">-- Chọn thành viên nhận việc --</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.username} ({m.role})</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl mt-2">
                {loading ? "Đang xử lý..." : "Phát Hành Công Việc"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;