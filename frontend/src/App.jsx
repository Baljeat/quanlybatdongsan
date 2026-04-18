import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import AdminLayout from "./layouts/AdminLayout";

// --- 1. IMPORT CÁC TRANG QUẢN LÝ ---
import QuanLyNhanVien from './pages/QuanLyNhanVien'; 
import DanhSachBDS from './pages/DanhSachBDS';      
import KhachHang from "./pages/khachhang/KhachHang"; 
import AddKhachHang from "./pages/khachhang/AddKhachHang";
import CreateHopDong from './pages/hopdong/Hopdongdatcoc'; 

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
// --- Import của Nam (module Ký Gửi) ---
import TaoKyGui from './pages/kygui/TaoKyGui';
import QuanLyKyGui from './pages/kygui/QuanLyKyGui';
import SuaKyGui from './pages/kygui/SuaKyGui';
import HopDongChuyenNhuong from "./pages/HopDongChuyenNhuong";

// --- 2. AUTH CHECK (Dùng bản feat cho bảo mật) ---
const isAuthenticated = () => !!localStorage.getItem("user"); 
const getRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role;
  } catch (e) {
    return null;
  }
};

// --- 3. ROUTE GUARDS ---
const PrivateRoute = ({ children }) => (
  isAuthenticated() ? children : <Navigate to="/login" replace />
);

const PublicRoute = ({ children }) => (
  isAuthenticated() ? <Navigate to="/" replace /> : children
);

const RoleRoute = ({ children, allow }) => {
  const role = getRole();
  return allow.includes(role) ? children : <Navigate to="/" replace />;
};

const Placeholder = ({ title }) => <div style={{ padding: 20 }}><h2>{title}</h2></div>;

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1677ff", borderRadius: 6 } }}>
      <BrowserRouter>
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN ROUTES */}
          <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* MODULE KHACH HANG */}
            <Route path="khach-hang" element={<KhachHang />} />
            <Route path="khach-hang/add" element={<AddKhachHang />} />

            {/* MODULE NHAN VIEN (ADMIN ONLY) */}
            <Route 
              path="nhan-vien" 
              element={
                <RoleRoute allow={["admin"]}>
                  <QuanLyNhanVien />
                </RoleRoute>
              } 
            />

            {/* CÁC MODULE BẤT ĐỘNG SẢN & HỢP ĐỒNG */}
            {/* Thống nhất đường dẫn với AdminLayout */}
            <Route path="bat-dong-san" element={<DanhSachBDS />} />
            <Route path="danh-sach-bds" element={<Navigate to="/bat-dong-san" replace />} /> 
            <Route path="bat-dong-san/add" element={<Placeholder title="Thêm Bất Động Sản" />} />
            
            {/* MODULE KÝ GỬI */}
            <Route path="quan-ly-ky-gui" element={<QuanLyKyGui />} />
            <Route path="tao-ky-gui" element={<TaoKyGui />} />
            <Route path="sua-ky-gui/:id" element={<SuaKyGui />} />
            <Route path="hop-dong-ky-gui" element={<Navigate to="/quan-ly-ky-gui" replace />} />
            
            {/* CÁC HỢP ĐỒNG KHÁC */}
            <Route path="hop-dong-chuyen-nhuong" element={<HopDongChuyenNhuong />} />
            <Route path="hop-dong-dat-coc" element={<CreateHopDong />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;