// File: frontend/src/services/hdChuyenNhuongService.js
import api from './api'; // Import file api.js gốc của nhóm

export const hdChuyenNhuongService = {
  getAll: (keyword = '') => api.get(`/hdchuyennhuong?keyword=${keyword}`),
  create: (data) => api.post('/hdchuyennhuong', data),
  delete: (id) => api.delete(`/hdchuyennhuong/${id}`),
  getBDSInfo: (bdsid) => api.get(`/hdchuyennhuong/bds/${bdsid}`),
  
  // API lấy danh sách HĐ đặt cọc chưa được chuyển nhượng
  getHDDatCocHopLe: () => api.get('/hdchuyennhuong/hopdongdatcoc') 
};