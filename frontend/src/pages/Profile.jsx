import { User } from "lucide-react";

const Profile = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-black text-slate-800">Thông Tin Tài Khoản</h2>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
          <User size={16} className="text-indigo-500" /> Hồ Sơ Người Dùng
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Tên hiển thị</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{user?.username || "Chưa cập nhật"}</p>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Địa chỉ Email</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{user?.email || "Chưa cập nhật"}</p>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Vai trò quyền hạn</p>
            <p className="font-black text-indigo-600 text-sm mt-0.5 uppercase tracking-wide">{user?.role || "MEMBER"}</p>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Nhóm liên kết</p>
            <p className="font-black text-slate-700 text-sm mt-0.5">{user?.teamId || "Chưa gia nhập nhóm"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;