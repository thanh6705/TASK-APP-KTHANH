import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Plus, UserPlus, ArrowRight, Shield } from "lucide-react";

const Teams = ({ onViewDetails }) => {
  const { fetchWithAuth, updateUserInfo } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState("");

  const getMyTeams = async () => {
    try {
      const res = await fetchWithAuth("/team/my-teams"); // Đã sửa khớp router BE
      if (res.ok) {
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : data.teams || []);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách nhóm:", err);
    }
  };

  useEffect(() => {
    getMyTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetchWithAuth("/team/create", {
        method: "POST",
        body: JSON.stringify({ name: teamName })
      });
      const data = await res.json();
      if (res.ok) {
        setTeamName("");
        setMsg("Tạo nhóm mới thành công!");
        if (data.team) {
          updateUserInfo({ teamId: data.team.teamId, role: "leader" });
        }
        getMyTeams();
      } else {
        setMsg(data.message || "Không thể tạo nhóm.");
      }
    } catch (err) {
      setMsg("Có lỗi xảy ra khi kết nối server.");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetchWithAuth("/team/join", {
        method: "POST",
        body: JSON.stringify({ teamId: joinCode })
      });
      const data = await res.json();
      if (res.ok) {
        setJoinCode("");
        setMsg("Đã gia nhập nhóm thành công!");
        if (data.team) {
          updateUserInfo({ teamId: data.team.teamId, role: "member" });
        }
        getMyTeams();
      } else {
        setMsg(data.message || "Mã nhóm không hợp lệ.");
      }
    } catch (err) {
      setMsg("Lỗi kết nối.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">👥 Đội Nhóm Làm Việc</h2>
        <p className="text-xs text-slate-400 mt-0.5">Tạo không gian làm việc chung hoặc tham gia cùng đồng đội</p>
      </div>
      
      {msg && <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-3 rounded-xl text-xs max-w-xl">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tạo Team */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Plus size={14} className="text-indigo-600"/> Tạo Nhóm Mới</h3>
          <p className="text-[11px] text-slate-400">Trở thành trưởng nhóm (Leader) phân quyền và quản lý task.</p>
          <form onSubmit={handleCreateTeam} className="flex gap-2">
            <input
              type="text" placeholder="Tên nhóm mới của bạn..." required
              className="flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-500 bg-slate-50"
              value={teamName} onChange={e => setTeamName(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Tạo</button>
          </form>
        </div>

        {/* Tham Gia Team */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><UserPlus size={14} /> Gia Nhập Bằng Mã</h3>
          <p className="text-[11px] text-slate-400">Gia nhập nhóm của người khác bằng mã code nhóm.</p>
          <form onSubmit={handleJoinTeam} className="flex gap-2">
            <input
              type="text" placeholder="Ví dụ: TEAM-1234" required
              className="flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-500 bg-slate-50 uppercase"
              value={joinCode} onChange={e => setJoinCode(e.target.value)}
            />
            <button type="submit" className="bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs">Gia Nhập</button>
          </form>
        </div>
      </div>

      {/* Danh sách các nhóm */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">📌 Các Nhóm Đã Tham Gia ({teams.length})</h3>
        {teams.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed text-center text-slate-400 text-xs italic">
            Bạn chưa tham gia bất kỳ nhóm làm việc nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(t => (
              <div key={t._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-black text-slate-800 truncate">{t.name}</h4>
                    {t.isLeader && (
                      <span className="flex items-center gap-0.5 bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">
                        <Shield size={10} /> LEADER
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">Mã ID: {t.teamId}</p>
                  <p className="text-[10px] text-slate-400">Thành viên tham gia: {t.memberCount || 0}</p>
                </div>
                {/* Gọi hàm kích hoạt đổi Tab SPA */}
                <button
                  onClick={() => onViewDetails(t)}
                  className="w-full text-center bg-indigo-50 text-indigo-600 py-2 rounded-xl text-[11px] font-bold hover:bg-indigo-100 flex items-center justify-center gap-1"
                >
                  Vào Phòng Làm Việc <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;