import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Tất cả các trang gộp hết vào Dashboard xử lý Tab */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;