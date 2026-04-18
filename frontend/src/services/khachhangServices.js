import api from "./api";

export const getAllKhachHang = (params = {}) => api.get('/khachhang', { params });
export const createKhachHang = (data) => api.post('/khachhang', data);
export const updateKhachHang = (id, data) => api.put(`/khachhang/${id}`, data);
export const deleteKhachHang = (id) => api.delete(`/khachhang/${id}`);