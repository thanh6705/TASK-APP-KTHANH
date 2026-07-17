import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskCalendar from "./pages/TaskCalendar"; 
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails"; // <-- Đảm bảo đã import đúng file này
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<TaskCalendar />} />
            <Route path="teams" element={<Teams />} />
            {/* THIẾU DÒNG NÀY ĐÂY - KHAI BÁO PATH ĐỂ HIỂN THỊ PHÒNG CHI TIẾT */}
            <Route path="teams/:teamId" element={<TeamDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;