import { Search, Bell } from "lucide-react";

const Header = ({ searchGlobal, setSearchGlobal, user }) => {
  return (
    <header className="h-16 border-b bg-white border-slate-100 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div className="w-96 relative flex items-center">
        <Search className="absolute left-3.5 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Tìm nhanh tên công việc..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
          value={searchGlobal}
          onChange={(e) => setSearchGlobal(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl relative transition-colors">
          <Bell size={18} />
          <span className="absolute w-1.5 h-1.5 bg-indigo-500 rounded-full top-2 right-2"></span>
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase">
            {user?.username?.substring(0, 2) || "U"}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-black text-slate-700 leading-none">{user?.username || "Thành viên"}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{user?.email || "user@taskflow.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;