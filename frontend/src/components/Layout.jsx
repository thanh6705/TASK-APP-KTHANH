import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Home, Calendar, Users, User, LogOut } from "lucide-react";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/", name: "Trang Chính", icon: <Home size={18} /> },
    { path: "/calendar", name: "Lịch Trình", icon: <Calendar size={18} /> },
    { path: "/teams", name: "Nhóm Của Tôi", icon: <Users size={18} /> },
    { path: "/profile", name: "Tài Khoản", icon: <User size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-800">
            <span className="text-xl font-black text-indigo-400 tracking-wider">⚡ TASK FLOW</span>
          </div>
          
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-850">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Người dùng</p>
            <p className="font-bold text-slate-200 truncate">{user?.username || "Thành viên"}</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 rounded-xl text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;