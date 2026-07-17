import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    
    try {
      const res = await fetch(`http://localhost:5000/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xác thực thất bại");
      
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black text-center text-slate-850 mb-1">
          {isRegister ? "Đăng Ký Tài Khoản" : "Chào Mừng Trở Lại"}
        </h2>
        <p className="text-center text-slate-400 text-xs mb-6">Đồng bộ hoàn hảo với hệ thống BackEnd</p>
        
        {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">TÊN HIỂN THỊ</label>
              <input
                type="text" required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
            <input
              type="email" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">MẬT KHẨU</label>
            <input
              type="password" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-md">
            {isRegister ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-600 font-bold hover:underline">
            {isRegister ? "Đăng nhập" : "Tạo tài khoản mới"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;