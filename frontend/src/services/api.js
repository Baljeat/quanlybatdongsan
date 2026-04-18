import axios from "axios";

const api = axios.create({
  // Chọn Port 5000 để khớp với Backend Server
  baseURL: "http://localhost:3000/api", 
});

// Gắn token tự động vào header cho mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- CÁC APIS DÙNG CHUNG ---

// Lấy danh sách BĐS (Dùng cho cả trang danh sách và trang Hợp đồng)
export const getBatDongSan = () => api.get("/batdongsan");

// Lấy chi tiết 1 BĐS cụ thể
export const getChiTietBDS = (id) => api.get(`/batdongsan/${id}`);

export default api;
