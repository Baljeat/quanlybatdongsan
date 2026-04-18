import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// 1. Tạo hợp đồng đặt cọc
export const createHopDongDatCoc = async (data) => {
    // Backend: router.post('/', hopDongController.createHopDong) 
    // nên đường dẫn sẽ là /api/hopdong
    return await axios.post(`${API_BASE_URL}/hopdong`, data);
};

// 2. Lấy danh sách Bất động sản (để hiển thị lên Select)
// backend/services/hopdongServices.js
export const getDanhSachBDS = () => {
    return axios.get('http://localhost:3000/api/batdongsan');
};

// 3. Lấy danh sách Khách hàng
export const getDanhSachKH = async () => {
    return await axios.get(`${API_BASE_URL}/khachhang`);
};