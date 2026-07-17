import React, { createContext, useState, useEffect } from "react";

// Tạo và export AuthContext để các component khác import vào sử dụng
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi tải lại trang
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Hàm xử lý đăng nhập thành công
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Hàm xử lý đăng xuất an toàn tối đa
  const logout = () => {
    // 1. Clear sạch sẽ localStorage để không dính token cũ
    localStorage.removeItem("user");
    localStorage.clear(); 
    setUser(null);
    
    // 2. Refresh lại toàn bộ trang web để reset sạch state của React, tránh dính cache token
    window.location.href = "/login";
  };

  // Cập nhật thông tin user cục bộ khi thay đổi nhóm hoặc vai trò
  const updateUserInfo = (newData) => {
    const updated = { ...user, ...newData };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  // Hàm tự động đính kèm Token trong Header khi gọi API lên Backend
  const fetchWithAuth = async (url, options = {}) => {
    // Lấy token trực tiếp từ localStorage để đảm bảo tính thời gian thực, không bị trễ theo React State
    const savedUserString = localStorage.getItem("user");
    const savedUser = savedUserString ? JSON.parse(savedUserString) : null;
    const token = savedUser?.token || user?.token;

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    return fetch(`http://localhost:5000/api${url}`, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserInfo, fetchWithAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};