import { useState } from "react";
import { Moon, Sun, Lock, LogOut } from "lucide-react";

const Settings = ({ user, fetchWithAuth, logout, darkMode, setDarkMode }) => {
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    
    const res = await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Đổi mật khẩu thành công!");
      setForm({ old_password: "", new_password: "" });
    } else {
      setErr(data.message || "Đổi mật khẩu không thành công.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-black text-slate-800">Cài Đặt Hệ Thống</h2>

      {/* CHỨC NĂNG CHẾ ĐỘ TỐI */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            {darkMode ? <Moon size={16} className="text-indigo-500" /> : <Sun size={16} className="text-amber-500" />} 
            Giao diện hiển thị
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Chuyển đổi giữa chế độ sáng và tối để bảo vệ mắt</p>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${darkMode ? "bg-indigo-600 flex justify-end" : "bg-slate-200 flex justify-start"}`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-md block"></span>
        </button>
      </div>

      {/* CHỨC NĂNG ĐỔI MẬT KHẨU CHUYỂN TỪ PROFILE SANG */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
          <Lock size={16} className="text-slate-400" /> Bảo mật & Đổi Mật Khẩu
        </h3>
        {msg && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold">{msg}</div>}
        {err && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold">{err}</div>}
        
        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-500 mb-1">Mật khẩu hiện tại</label>
            <input type="password" required className="w-full px-3 py-2 border rounded-xl outline-none" value={form.old_password} onChange={(e) => setForm({ ...form, old_password: e.target.value })} />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">Mật khẩu mới</label>
            <input type="password" required className="w-full px-3 py-2 border rounded-xl outline-none" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-700 transition-colors">
            Cập Nhật Mật Khẩu
          </button>
        </form>
      </div>

      {/* NÚT ĐĂNG XUẤT HỆ THỐNG */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <LogOut size={16} className="text-rose-500" /> Đăng xuất tài khoản
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Xóa phiên làm việc hiện tại khỏi thiết bị này</p>
        </div>
        <button onClick={logout} className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors">
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Settings;