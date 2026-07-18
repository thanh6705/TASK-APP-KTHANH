import { LayoutDashboard, Calendar, Users, User, Settings, CheckSquare, LogOut } from "lucide-react";

const Sidebar = ({ currentTab, setCurrentTab, handleLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Trang Chính", icon: LayoutDashboard },
    { id: "tasks", label: "Trang Task", icon: CheckSquare },
    { id: "calendar", label: "Trang Lịch", icon: Calendar },
    { id: "teams", label: "Trang Team", icon: Users },
    { id: "profile", label: "Trang Profile", icon: User },
    { id: "settings", label: "Trang Setting", icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col justify-between fixed left-0 top-0 shadow-xl z-20">
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md/30">T</div>
          <h1 className="text-xl font-black text-white tracking-wider uppercase">TaskFlow</h1>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;