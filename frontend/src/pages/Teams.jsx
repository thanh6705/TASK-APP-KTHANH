import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, UserPlus, ArrowRight, Shield } from "lucide-react";

const Teams = () => {
  const { fetchWithAuth, updateUserInfo } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState("");

  const getMyTeams = async () => {
    try {
      const res = await fetchWithAuth("/team/my-teams");
      if (res.ok) {
        const data = await res.json();
        // Backend của bạn trả về mảng trực tiếp hoặc trong trường teams[cite: 12]
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
        updateUserInfo({ teamId: data.team.teamId, role: "leader" });
        getMyTeams();
      } else {
        setMsg(data.message || "Không thể tạo nhóm. Vui lòng kiểm tra lại phía server.");
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
        updateUserInfo({ teamId: data.team.teamId, role: "member" });
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
      <h2 className="text-2xl font-black text-slate-800">Đội Nhóm Làm Việc</h2>
      {msg && <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-3 rounded-lg text-xs max-w-xl">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tạo Team */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-1.5"><Plus size={18} /> Tạo Nhóm Mới</h3>
          <p className="text-xs text-slate-400">Trở thành trưởng nhóm (Leader) phân quyền và quản lý task.</p>
          <form onSubmit={handleCreateTeam} className="flex gap-2">
            <input
              type="text" placeholder="Tên nhóm mới của bạn..." required
              className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              value={teamName} onChange={e => setTeamName(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Tạo</button>
          </form>
        </div>

        {/* Tham Gia Team */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-1.5"><UserPlus size={18} /> Gia Nhập Bằng Mã</h3>
          <p className="text-xs text-slate-400">Gia nhập nhóm của người khác bằng mã code nhóm.</p>
          <form onSubmit={handleJoinTeam} className="flex gap-2">
            <input
              type="text" placeholder="Ví dụ: TEAM-1234" required
              className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              value={joinCode} onChange={e => setJoinCode(e.target.value)}
            />
            <button type="submit" className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-900">Gia Nhập</button>
          </form>
        </div>
      </div>

      {/* Danh sách các nhóm */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-slate-700">📌 Các Nhóm Đã Tham Gia</h3>
        {teams.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed text-center text-slate-400 text-sm">
            Bạn chưa tham gia bất kỳ nhóm làm việc nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map(t => (
              <div key={t._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 truncate pr-2">{t.name}</h4>
                    {t.isLeader && (
                      <span className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0">
                        <Shield size={10} /> LEADER
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-indigo-600 font-mono mt-1">Mã ID: {t.teamId}</p>
                </div>
                <button
                  onClick={() => window.location.href = `/teams/${t._id}`}
                  className="w-full text-center bg-indigo-50 text-indigo-600 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 flex items-center justify-center gap-1"
                >
                  Vào Phòng Làm Việc <ArrowRight size={14} />
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