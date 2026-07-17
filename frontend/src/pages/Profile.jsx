import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, fetchWithAuth } = useContext(AuthContext);
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    
    const res = await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Đổi mật khẩu thành công!");
      setForm({ old_password: "", new_password: "" });
    } else {
      setErr(data.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">Cài Đặt Tài Khoản</h2>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-700 border-b pb-2">🛡️ Hồ Sơ Người Dùng</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Tên hiển thị</p>
            <p className="font-bold text-slate-800">{user?.username}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Địa chỉ Email</p>
            <p className="font-bold text-slate-800">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Vai trò</p>
            <p className="font-bold text-indigo-600 uppercase">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Nhóm đang liên kết</p>
            <p className="font-bold text-slate-800">{user?.teamId || "Chưa gia nhập nhóm"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-700 border-b pb-2">🔒 Đổi Mật Khẩu</h3>
        {msg && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-xs font-bold">{msg}</div>}
        {err && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-bold">{err}</div>}
        
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={form.old_password}
              onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu mới</label>
            <input
              type="password" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Cập Nhật Mật Khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;